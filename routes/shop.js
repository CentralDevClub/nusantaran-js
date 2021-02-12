const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop');
const needAuth = require('../middleware/needAuth');

router.get('/', shopController.getIndex);
router.get('/products', shopController.getProductList);
router.get('/products/:id' ,shopController.getProductDetail);
router.get('/cart', needAuth, shopController.getCart);
router.post('/cart', needAuth, shopController.postCart);
router.post('/cart-delete', needAuth, shopController.postDeleteCart);
router.post('/cart-update', needAuth, shopController.postUpdateQty)
router.get('/checkout', needAuth, shopController.getCheckout);
router.post('/checkout', needAuth, shopController.postCheckout);
router.get('/checkout/success', needAuth, shopController.getCheckoutSuccess);

module.exports = router;