module.exports = (req, res, next) => {
  const { name, price, stock } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('name es requerido y debe tener al menos 2 caracteres.');
  }
  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    errors.push('price es requerido y debe ser un numero >= 0.');
  }
  if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
    errors.push('stock debe ser un numero >= 0.');
  }

  if (errors.length) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Datos de producto invalidos',
      errors,
      hostname: require('os').hostname(),
      timestamp: new Date().toISOString(),
    });
  }
  next();
};
