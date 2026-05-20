const db = require('./pool');
const logger = require('../utils/logger');
const config = require('../config/config');

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    description TEXT,
    price       DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock       INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const SEED = [
  ['Laptop Lenovo ThinkPad', 'Equipo corporativo i7 16GB', 4500000, 15],
  ['Mouse Logitech MX Master', 'Mouse inalambrico ergonomico', 380000, 40],
  ['Teclado mecanico Keychron', 'Switches red, RGB', 520000, 25],
  ['Monitor LG UltraWide 29', 'Resolucion 2560x1080', 1200000, 12],
  ['Webcam Logitech C920', 'Full HD 1080p', 280000, 30],
];

async function initializeDatabase() {
  if (!config.useDb) {
    logger.info('useDb=false (test mode). Saltando inicializacion de BD.');
    return;
  }

  await db.query(CREATE_TABLE_SQL);

  const { rows } = await db.query('SELECT COUNT(*) AS total FROM products');
  const total = Number(rows[0].total);
  if (total === 0) {
    logger.info('Tabla products vacia. Cargando datos de seed...');
    for (const [name, description, price, stock] of SEED) {
      await db.query(
        'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
        [name, description, price, stock]
      );
    }
    logger.info(`Seed completado: ${SEED.length} productos insertados.`);
  } else {
    logger.info(`Tabla products ya contiene ${total} registros.`);
  }
}

module.exports = { initializeDatabase };
