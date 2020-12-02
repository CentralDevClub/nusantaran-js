const Product = require('../models/products')

exports.getProductList = (req,res,next)=>{
    Product.fetchAll(products => {
        const hasProduct = products.length > 0 ? true : false;
        res.render('shop/products-list',{
            'title':'Nusantaran JS | Original Taste of Nusantara',
            'path':'/products-list',
            'hasProduct': hasProduct,
            'products':products
        });
    });
};

exports.getIndex = (req,res,next)=>{
    res.render('shop/index',{
        'title':'Nusantaran JS | Welcome',
        'path':'/'
    });
};

exports.getCart = (req,res,next)=>{
    res.render('shop/cart',{
        'title':'Nusantaran JS | Cart',
        'path':'/cart'
    });
};

exports.getCheckout = (req,res,next)=>{
    res.render('shop/checkout',{
        'title':'Nusantaran JS | Checkout',
        'path':'/checkout'
    });
};