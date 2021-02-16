const express = require('express');
const router = express.Router();
const userRouter = require('../controllers/user');
const needAuth = require('../middleware/needAuth');
const { check, body } = require('express-validator');


router.get('/profile', needAuth, userRouter.getUser);
router.post('/logout', needAuth, userRouter.postLogout);
router.get('/reset', userRouter.getReset);
router.post('/reset', [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail()
], userRouter.postReset);
router.get('/newpassword', userRouter.getNewPassword);
router.post('/newpassword', [
    body('password', 'Password length minimum is 8 and only contains letter and number')
        .isLength({ min: 8 })
        .isAlphanumeric()
        .trim(),
    body('password-repeat')
        .trim()
        .custom((value, { req })=>{
            if (value !== req.body.password){
                throw new Error('Password does not match')
            }
            return true
        })
], userRouter.postNewPassword);


module.exports = router;