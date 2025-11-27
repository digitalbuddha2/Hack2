import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  return db.createUser(email, passwordHash);
}

async function verifyUser(email, password) {
  const user = db.getUserByEmail(email);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  return { id: user.id, email: user.email };
}

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// Middleware to require authentication
function requireAuth(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.userId = userId;
  next();
}

export {
  createUser,
  verifyUser,
  generateToken,
  verifyToken,
  requireAuth
};
