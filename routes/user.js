const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const needAuth = require('../middleware/needAuth');

router.get('/profile', needAuth, userController.getUser);

module.exports = router;