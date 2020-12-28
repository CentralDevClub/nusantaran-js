const express = require('express');
const router = express.Router();
const authRouter = require('../controllers/auth');

router.get('/register',authRouter.getRegister);
router.post('/register',authRouter.postRegister);
router.get('/login',authRouter.getLogin);
router.post('/login',authRouter.postLogin);

module.exports = router;