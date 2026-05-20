require('dotenv').config();
const db = require('./pool');
const { initializeDatabase } = require('./initDb');
const logger = require('../utils/logger');

(async () => {
  try {
    logger.info('Eliminando tabla products si existe...');
    await db.query('DROP TABLE IF EXISTS products');
    logger.info('Inicializando esquema y seed...');
    await initializeDatabase();
    logger.info('Seed finalizado correctamente.');
  } catch (err) {
    logger.error('Error en seed:', err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
})();
