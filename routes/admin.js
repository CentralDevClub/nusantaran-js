const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin')
const needAuth = require('../middleware/needAuth');

router.get('/product', adminController.getProduct);
router.post('/add-product',needAuth, adminController.postAddProduct);
router.post('/update-product',needAuth, adminController.postUpdateProduct);
router.post('/delete-product',needAuth, adminController.postDeleteProduct);

module.exports = router;