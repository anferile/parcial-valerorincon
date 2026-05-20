const os = require('os');
const db = require('../db/pool');
const config = require('../config/config');

const baseInfo = () => ({
  service: 'Parcial Valero - AWS API',
  version: '1.0.0',
  hostname: os.hostname(),
  pid: process.pid,
  env: config.env,
  timestamp: new Date().toISOString(),
});

exports.health = (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime_seconds: Math.round(process.uptime()),
    ...baseInfo(),
  });
};

exports.status = async (req, res) => {
  let dbStatus = 'unknown';
  let productCount = null;

  if (config.useDb) {
    try {
      const { rows } = await db.query('SELECT NOW() AS now');
      dbStatus = `ok (server time: ${new Date(rows[0].now).toISOString()})`;
      const c = await db.query('SELECT COUNT(*) AS total FROM products');
      productCount = Number(c.rows[0].total);
    } catch (err) {
      dbStatus = `error: ${err.message}`;
    }
  } else {
    dbStatus = 'disabled (test mode)';
  }

  res.status(200).json({
    status: 'ok',
    database: dbStatus,
    product_count: productCount,
    memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    uptime_seconds: Math.round(process.uptime()),
    ...baseInfo(),
  });
};
