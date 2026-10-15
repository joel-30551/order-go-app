const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { createClerkClient } = require('@clerk/clerk-sdk-node');

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY is not set in backend/.env');
}

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * Middleware that verifies the Clerk JWT from the Authorization header.
 * On success, sets req.userId to the Clerk user ID (e.g. "user_xxxxxxxx").
 * Returns 401 if the token is missing or invalid.
 */
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Auth Header present:', !!authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Auth Header missing or invalid format');
    return res.status(401).json({ success: false, message: 'Unauthorized: missing token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = await clerkClient.verifyToken(token);
    if (!payload || !payload.sub) {
      throw new Error('Token payload missing "sub" claim.');
    }
    req.userId = payload.sub; // Clerk user ID
    console.log(`Auth Success: user ${req.userId}`);
    next();
  } catch (err) {
    console.error('Auth Error:', err.message);
    return res.status(401).json({ success: false, message: `Unauthorized: ${err.message}` });
  }
};

module.exports = requireAuth;
