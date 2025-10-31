const dotenv = require('dotenv');
dotenv.config();

const USER_API_KEY = process.env.USER_API_KEY || 'user-key-example';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-key-example';

function authRequired(req, res, next) {
  const apiKey = req.header('x-api-key');
  if (!apiKey) return res.status(401).json({ error: 'Missing API key in x-api-key header' });

  if (apiKey === ADMIN_API_KEY) {
    req.user = { id: 'admin', isAdmin: true };
    return next();
  }
  if (apiKey === USER_API_KEY) {
    req.user = { id: 'user1', isAdmin: false };
    return next();
  }
  return res.status(401).json({ error: 'Invalid API key' });
}

module.exports = { authRequired };
