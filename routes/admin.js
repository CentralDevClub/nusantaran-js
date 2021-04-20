const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin')
const needAuth = require('../middleware/needAuth');
const needAdmin = require('../middleware/needAdmin');
const { check, body } = require('express-validator');

router.get('/users', needAuth, needAdmin, adminController.getAllUsers)
router.get('/product', needAuth, needAdmin, adminController.getProduct);
router.post('/add-product', needAuth, needAdmin, [
    body('name').trim(),
    body('category').trim(),
    body('description', 'Minimum description is 20 character').isLength({ min : 20 }).trim(),
    body('price', 'Product minimum price is Rp.7000').isInt({min:7000}).trim()
], adminController.postAddProduct);
router.post('/update-product', needAuth, needAdmin, [
    check('imagepath').custom((_value, { req })=>{
        if (req.file.mimetype !== 'image/jpeg'||
            req.file.mimetype !== 'image/jpg' ||
            req.file.mimetype !== 'image/png' ){
                throw new Error('Please enter valid image file');
        }
        return true
    })
], adminController.postUpdateProduct);
router.post('/delete-product', needAuth, needAdmin, adminController.postDeleteProduct);
router.post('/myorder', needAuth, needAdmin, adminController.postChangeStatus);

module.exports = router;