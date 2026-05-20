const crypto = require('crypto');

module.exports = (req, _res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  next();
};
