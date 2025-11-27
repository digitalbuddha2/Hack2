import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

import * as db from './db.js';
import * as auth from './auth.js';
import * as stripeModule from './stripe.js';
import * as emailModule from './email.js';
import { chat, chatWithHistory } from './claude.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// ============ AUTH ROUTES ============

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { email: userEmail, password } = req.body;

    if (!userEmail || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existingUser = db.getUserByEmail(userEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await auth.createUser(userEmail, password);
    const token = auth.generateToken(user.id);

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email: userEmail, password } = req.body;

    const user = await auth.verifyUser(userEmail, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = auth.generateToken(user.id);
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Get current user
app.get('/api/me', auth.requireAuth, (req, res) => {
  const user = db.getUserById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    id: user.id,
    email: user.email,
    hasApiKey: !!user.anthropic_api_key,
    isSubscribed: user.subscription_status === 'active',
    subscriptionEnd: user.subscription_end
  });
});

// ============ API KEY ROUTES ============

// Set API key
app.post('/api/settings/api-key', auth.requireAuth, (req, res) => {
  try {
    const { apiKey } = req.body;
    db.updateUserApiKey(req.userId, apiKey || null);
    res.json({ success: true });
  } catch (error) {
    console.error('API key update error:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

// ============ STRIPE ROUTES ============

// Create checkout session for subscription
app.post('/api/subscribe', auth.requireAuth, async (req, res) => {
  try {
    const user = db.getUserById(req.userId);
    const session = await stripeModule.createCheckoutSession(user);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    await stripeModule.handleWebhook(req.body, req.headers['stripe-signature']);
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Cancel subscription
app.post('/api/cancel-subscription', auth.requireAuth, async (req, res) => {
  try {
    const user = db.getUserById(req.userId);
    if (user.stripe_subscription_id) {
      await stripeModule.cancelSubscription(user.stripe_subscription_id);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// ============ EMAIL WEBHOOK (SendGrid Inbound Parse) ============

app.post('/api/webhooks/email', upload.none(), async (req, res) => {
  try {
    console.log('Received inbound email webhook');

    // SendGrid sends form data
    const { from, to, subject, text, html } = req.body;

    console.log('From:', from);
    console.log('Subject:', subject);

    // Extract email address from "Name <email@example.com>" format
    const fromEmail = emailModule.extractEmail(from);

    if (!fromEmail) {
      console.log('Could not extract sender email');
      return res.status(200).send('OK'); // Always return 200 to SendGrid
    }

    // Find user by email
    const user = db.getUserByEmail(fromEmail);

    if (!user) {
      // Send "not registered" response
      await emailModule.sendEmail(
        fromEmail,
        'Re: ' + (subject || 'Your message'),
        `Hi!\n\nYou're not registered with ClaudeMail yet.\n\nSign up at ${process.env.BASE_URL} to start chatting with Claude via email!\n\n- ClaudeMail`
      );
      return res.status(200).send('OK');
    }

    // Check if user has access (subscription or API key)
    if (!user.anthropic_api_key && user.subscription_status !== 'active') {
      await emailModule.sendEmail(
        fromEmail,
        'Re: ' + (subject || 'Your message'),
        `Hi!\n\nYou need an active subscription or your own API key to use ClaudeMail.\n\nManage your account at ${process.env.BASE_URL}\n\n- ClaudeMail`
      );
      return res.status(200).send('OK');
    }

    // Get the message content
    const messageContent = text || html || subject || '';

    if (!messageContent.trim()) {
      await emailModule.sendEmail(
        fromEmail,
        'Re: ' + (subject || 'Your message'),
        `Hi!\n\nYour email appears to be empty. Please send a message with your question.\n\n- ClaudeMail`
      );
      return res.status(200).send('OK');
    }

    // Use user's API key or fall back to system key
    const apiKey = user.anthropic_api_key || process.env.ANTHROPIC_API_KEY;

    // Check for existing thread (conversation continuity)
    let threadId = emailModule.extractThreadId(subject);
    let response;

    if (threadId) {
      // Existing thread - get conversation history
      const existingSession = db.getAgentSession(threadId);

      if (existingSession && existingSession.user_id === user.id) {
        // Continue existing conversation with history
        const previousMessages = db.getConversationsByThread(threadId);
        const messages = previousMessages.flatMap(c => [
          { role: 'user', content: c.user_message },
          { role: 'assistant', content: c.assistant_response }
        ]);
        messages.push({ role: 'user', content: messageContent });

        console.log('Continuing thread:', threadId, 'with', previousMessages.length, 'previous messages');
        response = await chatWithHistory(messages, apiKey);
      } else {
        // Thread ID not found or doesn't belong to user, start new thread
        threadId = uuidv4();
        db.createAgentSession(user.id, threadId);
        console.log('Starting new thread (invalid existing):', threadId);
        response = await chat(messageContent, apiKey);
      }
    } else {
      // New conversation - create new thread
      threadId = uuidv4();
      db.createAgentSession(user.id, threadId);
      console.log('Starting new thread:', threadId);
      response = await chat(messageContent, apiKey);
    }

    // Log the conversation with thread ID
    db.logConversation(user.id, messageContent, response, threadId);

    // Format subject with thread ID for reply tracking
    const responseSubject = emailModule.formatSubject(subject, threadId);

    // Send response email
    await emailModule.sendEmail(
      fromEmail,
      responseSubject,
      response + '\n\n---\nSent via ClaudeMail (powered by Claude Agent SDK)\nThread: ' + threadId + '\nManage account: ' + process.env.BASE_URL
    );

    console.log('Response sent to:', fromEmail, 'thread:', threadId);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Email webhook error:', error);
    res.status(200).send('OK'); // Always return 200 to prevent retries
  }
});

// ============ CONVERSATION HISTORY ============

app.get('/api/conversations', auth.requireAuth, (req, res) => {
  try {
    const conversations = db.getConversations(req.userId, 50);
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    sdk: 'claude-agent-sdk'
  });
});

// ============ SPA FALLBACK ============

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============ START SERVER ============

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ClaudeMail server running on port ${PORT}`);
  console.log(`Powered by Claude Agent SDK`);
  console.log(`Dashboard: http://localhost:${PORT}`);
});
