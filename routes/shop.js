const express = require('express');
const router = express.Router();
const products = require('./admin').products;

router.get('/',(req,res,next)=>{
    res.render('shop',{
        'title':'Nusantaran JS | Original Taste of Nusantara',
        'path':'/',
        'products':products
    });
});

module.exports = router;