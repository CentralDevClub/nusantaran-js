const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin')

router.post('/add-product',adminController.postAddProduct);
router.get('/product',adminController.getProduct);
router.post('/update-product',adminController.postUpdateProduct);
router.post('/delete-product',adminController.postDeleteProduct);

module.exports = router;