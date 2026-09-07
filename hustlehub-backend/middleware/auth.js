const jwt = require('jsonwebtoken');
const config = require('../config/keys');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, config.jwtSecret);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ status: 'fail', message: 'Invalid or expired token.' });
  }
};

module.exports = authenticateToken;
