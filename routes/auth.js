const express = require('express');
const router = express.Router();
const authRouter = require('../controllers/auth');
const forbidAuth = require('../middleware/forbidAuth');
const { check, body } = require('express-validator');

router.get('/register', forbidAuth, authRouter.getRegister);
router.post('/register',forbidAuth,[
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
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
], authRouter.postRegister);

router.get('/login', forbidAuth, authRouter.getLogin);
router.post('/login', [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password').trim()
], forbidAuth, authRouter.postLogin);
router.post('/logout', authRouter.postLogout);

module.exports = router;