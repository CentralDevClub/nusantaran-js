const express = require('express');
const router = express.Router();
const productController = require('../controllers/products')

router.get('/add-product',productController.getAddProduct);
router.post('/add-product',productController.postAddProduct);

module.exports = router;