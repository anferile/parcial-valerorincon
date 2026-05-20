const db = require('../db/pool');

const SELECT_FIELDS =
  'SELECT id, name, description, price, stock, created_at, updated_at FROM products';

const productService = {
  async listAll({ limit = 50, offset = 0 } = {}) {
    const safeLimit = Math.max(1, Math.min(parseInt(limit, 10) || 50, 200));
    const safeOffset = Math.max(0, parseInt(offset, 10) || 0);
    const { rows } = await db.query(
      `${SELECT_FIELDS} ORDER BY id ASC LIMIT ${safeLimit} OFFSET ${safeOffset}`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query(`${SELECT_FIELDS} WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async create({ name, description = null, price, stock = 0 }) {
    const { insertId } = await db.query(
      'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
      [name, description, price, stock]
    );
    return productService.findById(insertId);
  },

  async update(id, { name, description, price, stock }) {
    const { rowCount } = await db.query(
      `UPDATE products
         SET name        = COALESCE(?, name),
             description = COALESCE(?, description),
             price       = COALESCE(?, price),
             stock       = COALESCE(?, stock)
       WHERE id = ?`,
      [name ?? null, description ?? null, price ?? null, stock ?? null, id]
    );
    if (rowCount === 0) return null;
    return productService.findById(id);
  },

  async remove(id) {
    const { rowCount } = await db.query('DELETE FROM products WHERE id = ?', [id]);
    return rowCount > 0;
  },

  async count() {
    const { rows } = await db.query('SELECT COUNT(*) AS total FROM products');
    return Number(rows[0].total);
  },
};

module.exports = productService;
