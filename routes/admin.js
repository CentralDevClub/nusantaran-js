const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin')
const needAuth = require('../middleware/needAuth');
const { body } = require('express-validator');

router.get('/product', needAuth, adminController.getProduct);
router.post('/add-product', needAuth, [
    body('name').trim(),
    body('category').trim(),
    body('description', 'Minimum description is 20 character').isLength({ min : 20 }).trim(),
    body('price').isNumeric().trim()
], adminController.postAddProduct);
router.post('/update-product',needAuth, adminController.postUpdateProduct);
router.post('/delete-product',needAuth, adminController.postDeleteProduct);

module.exports = router;