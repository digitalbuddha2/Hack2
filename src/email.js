import sgMail from '@sendgrid/mail';

let initialized = false;

function initSendGrid() {
  if (!initialized && process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    initialized = true;
  }
}

// Extract email from various formats
// "John Doe <john@example.com>" -> "john@example.com"
// "john@example.com" -> "john@example.com"
function extractEmail(from) {
  if (!from) return null;

  // Try to extract from angle brackets
  const match = from.match(/<([^>]+)>/);
  if (match) {
    return match[1].toLowerCase();
  }

  // Check if it's already a plain email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(from.trim())) {
    return from.trim().toLowerCase();
  }

  // Try to find any email in the string
  const anyMatch = from.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
  if (anyMatch) {
    return anyMatch[0].toLowerCase();
  }

  return null;
}

// Extract thread ID from email subject (Re: [thread-id] Subject)
function extractThreadId(subject) {
  if (!subject) return null;
  const match = subject.match(/\[([a-f0-9-]+)\]/i);
  return match ? match[1] : null;
}

// Format subject with thread ID
function formatSubject(originalSubject, threadId) {
  // Remove existing thread ID if present
  const cleanSubject = originalSubject?.replace(/\s*\[[a-f0-9-]+\]\s*/gi, '').trim() || 'Your message';
  return `Re: [${threadId}] ${cleanSubject}`;
}

async function sendEmail(to, subject, text) {
  initSendGrid();

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    text
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent to:', to);
  } catch (error) {
    console.error('SendGrid error:', error);
    if (error.response) {
      console.error('SendGrid response:', error.response.body);
    }
    throw error;
  }
}

export {
  extractEmail,
  extractThreadId,
  formatSubject,
  sendEmail
};
