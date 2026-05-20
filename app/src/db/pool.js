const mysql = require('mysql2/promise');
const config = require('../config/config');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  ssl: config.db.ssl,
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit,
  idleTimeout: config.db.idleTimeout,
  connectTimeout: config.db.connectTimeout,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

async function query(text, params = []) {
  const [result] = await pool.query(text, params);
  if (Array.isArray(result)) {
    return { rows: result, rowCount: result.length };
  }
  return {
    rows: [],
    rowCount: result.affectedRows || 0,
    insertId: result.insertId,
  };
}

async function getClient() {
  return pool.getConnection();
}

async function end() {
  await pool.end();
}

pool.on('connection', () => logger.info('Nueva conexion MySQL creada en el pool.'));

module.exports = { query, getClient, end, pool };
