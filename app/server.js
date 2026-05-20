require('dotenv').config();

const app = require('./src/app');
const config = require('./src/config/config');
const logger = require('./src/utils/logger');
const { initializeDatabase } = require('./src/db/initDb');

const PORT = config.port;

(async () => {
  try {
    await initializeDatabase();
    logger.info('Base de datos inicializada correctamente.');
  } catch (err) {
    logger.warn(
      `No se pudo inicializar la base de datos (${err.message}). ` +
        'El servicio continuara arrancando; los endpoints CRUD ' +
        'fallaran hasta que la BD este disponible.'
    );
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`API escuchando en el puerto ${PORT} (env=${config.env})`);
    logger.info(`Hostname de esta instancia: ${require('os').hostname()}`);
  });
})();
