const express = require('express');
const router = express.Router();
const authRouter = require('../controllers/auth');

router.get('/register',authRouter.getRegister);
router.get('/login',authRouter.getLogin);

module.exports = router;