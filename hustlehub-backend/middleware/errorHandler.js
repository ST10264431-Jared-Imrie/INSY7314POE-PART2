const config = require('../config/keys');

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'An unexpected internal server error occurred.' : err.message,
    ...(config.nodeEnv === 'development' && { devDetails: err.message })
  });
};

module.exports = errorHandler;
