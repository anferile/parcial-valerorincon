const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validateProduct = require('../middleware/validateProduct');

router.get('/', productController.list);
router.get('/:id', productController.getById);
router.post('/', validateProduct, productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.remove);

module.exports = router;
