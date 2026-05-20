const os = require('os');
const productService = require('../services/productService');

const withMeta = (payload) => ({
  ...payload,
  hostname: os.hostname(),
  timestamp: new Date().toISOString(),
});

exports.list = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset = parseInt(req.query.offset, 10) || 0;
    const items = await productService.listAll({ limit, offset });
    res.status(200).json(withMeta({ status: 'ok', count: items.length, data: items }));
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json(withMeta({ status: 'error', message: 'id invalido' }));
    }
    const item = await productService.findById(id);
    if (!item) {
      return res.status(404).json(withMeta({ status: 'error', message: 'Producto no encontrado' }));
    }
    res.status(200).json(withMeta({ status: 'ok', data: item }));
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const created = await productService.create(req.body);
    res.status(201).json(withMeta({ status: 'ok', message: 'Producto creado', data: created }));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json(withMeta({ status: 'error', message: 'id invalido' }));
    }
    const updated = await productService.update(id, req.body);
    if (!updated) {
      return res.status(404).json(withMeta({ status: 'error', message: 'Producto no encontrado' }));
    }
    res.status(200).json(withMeta({ status: 'ok', message: 'Producto actualizado', data: updated }));
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json(withMeta({ status: 'error', message: 'id invalido' }));
    }
    const deleted = await productService.remove(id);
    if (!deleted) {
      return res.status(404).json(withMeta({ status: 'error', message: 'Producto no encontrado' }));
    }
    res.status(200).json(withMeta({ status: 'ok', message: `Producto ${id} eliminado` }));
  } catch (err) {
    next(err);
  }
};
