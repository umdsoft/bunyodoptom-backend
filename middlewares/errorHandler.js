const logger = require('../config/logger');

module.exports = (err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (status >= 500) logger.error({ err }, 'Unhandled error');
  else logger.warn({ err }, 'Client error');
  res.status(status).json({ success: false, message });
};
