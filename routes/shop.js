const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop')

router.get('/',shopController.getIndex);
router.get('/products-list',shopController.getProductList);
router.get('/cart',shopController.getCart);
router.get('/checkout',shopController.getCheckout);

module.exports = router;