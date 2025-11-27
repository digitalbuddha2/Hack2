const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

async function sendEmail(to, subject, text) {
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

module.exports = {
  extractEmail,
  sendEmail
};
