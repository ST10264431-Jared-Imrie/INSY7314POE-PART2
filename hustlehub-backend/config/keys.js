require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8443,
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key',
  nodeEnv: process.env.NODE_ENV || 'development'
};
