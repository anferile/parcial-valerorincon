require('dotenv').config();

const toBool = (v) => String(v).toLowerCase() === 'true';
const toInt = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 3000),

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: toInt(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'appuser',
    password: process.env.DB_PASSWORD || 'changeme',
    database: process.env.DB_NAME || 'appdb',
    ssl: toBool(process.env.DB_SSL) ? { rejectUnauthorized: false } : undefined,
    connectionLimit: toInt(process.env.DB_POOL_MAX, 10),
    idleTimeout: toInt(process.env.DB_POOL_IDLE_TIMEOUT_MS, 30000),
    connectTimeout: 10000,
  },

  useDb: process.env.NODE_ENV !== 'test',
};

module.exports = config;
