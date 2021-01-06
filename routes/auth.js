const express = require('express');
const router = express.Router();
const authRouter = require('../controllers/auth');
const forbidAuth = require('../middleware/forbidAuth');

router.get('/register', forbidAuth, authRouter.getRegister);
router.post('/register', forbidAuth, authRouter.postRegister);
router.get('/login', forbidAuth, authRouter.getLogin);
router.post('/login', forbidAuth, authRouter.postLogin);
router.post('/logout', authRouter.postLogout);

module.exports = router;