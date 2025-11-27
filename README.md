# ClaudeMail - AI Over Email

Talk to Claude AI via email. Powered by the **Claude Agent SDK** - like Claude Code, but over email.

## Features

- **Agentic AI**: Uses Claude Agent SDK for intelligent, multi-step reasoning
- **Web Search**: Agent can search the web for current information
- **Conversation Threading**: Maintains context across email replies
- **BYOK or Subscribe**: Use your own API key or subscribe for $20/mo
- **Conversation History**: View all past conversations in dashboard

## Quick Start (Test Locally)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=3000
JWT_SECRET=your-random-secret-key
BASE_URL=http://localhost:3000

# SendGrid - Get free account at https://sendgrid.com
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=ask@yourdomain.com

# Stripe - Get test keys at https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx

# Anthropic - Get key at https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-xxx
```

### 3. Create Stripe Price

In Stripe Dashboard:
1. Go to Products → Add Product
2. Name: "ClaudeMail Subscription"
3. Price: $20/month recurring
4. Copy the Price ID to `STRIPE_PRICE_ID`

### 4. Run Locally

```bash
npm start
```

Visit http://localhost:3000

## Deploy to Production

### Option 1: Railway (Recommended)

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Create project: `railway init`
4. Add environment variables: `railway variables set KEY=value`
5. Deploy: `railway up`

### Option 2: Any Docker Host

```bash
docker build -t claudemail .
docker run -p 3000:3000 --env-file .env claudemail
```

## Set Up Email Receiving (SendGrid)

1. **Add Domain to SendGrid**
   - Go to Settings → Sender Authentication
   - Add and verify your domain

2. **Set Up Inbound Parse**
   - Go to Settings → Inbound Parse
   - Add Host: `yourdomain.com`
   - URL: `https://your-app.railway.app/api/webhooks/email`
   - Check "POST the raw, full MIME message"

3. **Add MX Record**
   - Add MX record to your domain: `mx.sendgrid.net` priority 10

4. **Test**
   - Send email to `anything@yourdomain.com`
   - Check your app logs

## Set Up Stripe Webhooks

1. Go to Developers → Webhooks
2. Add endpoint: `https://your-app.railway.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## How It Works

1. User registers on web dashboard
2. User either:
   - Subscribes for $20/month, or
   - Adds their own Anthropic API key
3. User sends email to `ask@yourdomain.com`
4. System identifies user by sender email
5. **Claude Agent SDK processes the request** with:
   - Multi-step reasoning
   - Web search capability
   - Conversation context
6. Response sent back via email with thread ID
7. Replies maintain conversation context

## Conversation Threading

ClaudeMail maintains conversation context across email replies:

- Each new conversation gets a unique thread ID
- Thread ID is included in email subject: `Re: [abc123] Your question`
- Replying to an email continues the same conversation
- Agent remembers previous context for follow-up questions

## Claude Agent SDK Features

This project uses the Claude Agent SDK (`@anthropic-ai/claude-code`) which provides:

- **Agentic Processing**: Multi-turn reasoning with up to 10 steps
- **Tool Access**: Web search and web fetch capabilities
- **Streaming**: Real-time response generation
- **Error Handling**: Graceful fallbacks for API issues

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Create account |
| `/api/login` | POST | Login |
| `/api/logout` | POST | Logout |
| `/api/me` | GET | Get current user |
| `/api/settings/api-key` | POST | Set API key |
| `/api/subscribe` | POST | Create Stripe checkout |
| `/api/cancel-subscription` | POST | Cancel subscription |
| `/api/conversations` | GET | Get conversation history |
| `/api/webhooks/email` | POST | SendGrid inbound webhook |
| `/api/webhooks/stripe` | POST | Stripe webhook |
| `/api/health` | GET | Health check |

## Tech Stack

- **Backend**: Node.js + Express (ES Modules)
- **Database**: SQLite (better-sqlite3)
- **Email**: SendGrid
- **Payments**: Stripe
- **Auth**: JWT + bcrypt
- **AI**: Claude Agent SDK (`@anthropic-ai/claude-code`)

## Project Structure

```
src/
├── server.js      # Main Express server
├── db.js          # SQLite database with threading support
├── auth.js        # JWT authentication
├── stripe.js      # Stripe payments
├── email.js       # SendGrid integration with thread parsing
└── claude.js      # Claude Agent SDK integration
public/
└── index.html     # Web dashboard (SPA)
```

## License

MIT
