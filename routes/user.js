const express = require('express');
const router = express.Router();
const userRouter = require('../controllers/user');
const needAuth = require('../middleware/needAuth');

router.get('/profile', needAuth, userRouter.getUser);
router.post('/logout', needAuth, userRouter.postLogout);
router.get('/reset', userRouter.getReset);
router.post('/reset', userRouter.postReset);
router.get('/newpassword', userRouter.getNewPassword);
router.post('/newpassword', userRouter.postNewPassword);
router.post('/connect-stripe', needAuth, userRouter.postConnectStripe);

module.exports = router;