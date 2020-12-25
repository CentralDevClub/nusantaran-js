const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop')

router.get('/',shopController.getIndex);
router.get('/products',shopController.getProductList);
router.get('/products/:id',shopController.getProductDetail);
router.get('/cart',shopController.getCart);
router.post('/cart',shopController.postCart);
router.post('/cart-delete',shopController.postDeleteCart);
router.post('/cart-update',shopController.postUpdateQty)
router.get('/checkout',shopController.getCheckout);

module.exports = router;