const xss = require('xss');

/**
 * sanitizeBody
 * Recursively sanitizes all string values in req.body against XSS.
 * Also strips MongoDB operator keys (e.g. $gt, $where) to prevent NoSQL injection.
 */
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return xss(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    return sanitizeObject(value);
  }
  return value;
};

const sanitizeObject = (obj) => {
  const cleaned = {};
  for (const key of Object.keys(obj)) {
    // Strip MongoDB operator keys to prevent NoSQL injection
    if (key.startsWith('$')) continue;
    cleaned[key] = sanitizeValue(obj[key]);
  }
  return cleaned;
};

const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

module.exports = sanitizeBody;
