const csrf = require('csurf');

exports.protection = csrf();