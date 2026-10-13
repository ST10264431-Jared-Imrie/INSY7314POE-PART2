const jwt = require('jsonwebtoken');
const config = require('../config/keys');

/**
 * authenticateToken
 * Verifies the JWT Bearer token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
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

/**
 * authorizeRoles
 * RBAC middleware — restricts access to users with the specified roles.
 * Must be used AFTER authenticateToken.
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'freelancer', 'client')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: `Access denied. This route is restricted to: ${roles.join(', ')}.`
      });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };
