const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, _next) => {
  const status = err.statusCode || err.status || 500;
  logger.error(`[${req.id}] ${req.method} ${req.originalUrl} -> ${err.message}`);
  res.status(status).json({
    status: 'error',
    statusCode: status,
    message: err.publicMessage || err.message || 'Error interno del servidor',
    requestId: req.id,
    hostname: require('os').hostname(),
    timestamp: new Date().toISOString(),
  });
};
