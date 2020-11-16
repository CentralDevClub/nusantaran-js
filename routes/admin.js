const express = require('express');
const router = express.Router();

const products = [];

router.get('/add-product',(req,res,next)=>{
    res.render('add-product',{
        'title':'Nusantaran JS | Add Products',
        'path':'/add-product'
    });
});

router.post('/add-product',(req,res,next)=>{
    let product = req.body.product;
    console.log(`Product added : ${product}`);
    products.push(product)
    res.redirect('/');
});

module.exports = {'adminRoutes':router,'products':products};