const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/claudemail.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    anthropic_api_key TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    subscription_end INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    assistant_response TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
`);

// User operations
function createUser(email, passwordHash) {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)
  `);
  stmt.run(id, email.toLowerCase(), passwordHash);
  return { id, email: email.toLowerCase() };
}

function getUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email.toLowerCase());
}

function getUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}

function getUserByStripeCustomer(customerId) {
  const stmt = db.prepare('SELECT * FROM users WHERE stripe_customer_id = ?');
  return stmt.get(customerId);
}

function updateUserApiKey(userId, apiKey) {
  const stmt = db.prepare(`
    UPDATE users SET anthropic_api_key = ?, updated_at = unixepoch() WHERE id = ?
  `);
  stmt.run(apiKey, userId);
}

function updateUserStripeInfo(userId, customerId, subscriptionId, status, endDate) {
  const stmt = db.prepare(`
    UPDATE users SET
      stripe_customer_id = ?,
      stripe_subscription_id = ?,
      subscription_status = ?,
      subscription_end = ?,
      updated_at = unixepoch()
    WHERE id = ?
  `);
  stmt.run(customerId, subscriptionId, status, endDate, userId);
}

function updateSubscriptionStatus(customerId, status, endDate) {
  const stmt = db.prepare(`
    UPDATE users SET
      subscription_status = ?,
      subscription_end = ?,
      updated_at = unixepoch()
    WHERE stripe_customer_id = ?
  `);
  stmt.run(status, endDate, customerId);
}

// Conversation operations
function logConversation(userId, userMessage, assistantResponse) {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO conversations (id, user_id, user_message, assistant_response)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, userId, userMessage, assistantResponse);
  return id;
}

function getConversations(userId, limit = 50) {
  const stmt = db.prepare(`
    SELECT * FROM conversations
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);
  return stmt.all(userId, limit);
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByStripeCustomer,
  updateUserApiKey,
  updateUserStripeInfo,
  updateSubscriptionStatus,
  logConversation,
  getConversations
};
