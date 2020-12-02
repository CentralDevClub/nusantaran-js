const Product = require('../models/products')

exports.getAddProduct = (req,res,next)=>{
    res.render('add-product',{
        'title':'Nusantaran JS | Add Products',
        'path':'/add-product'
    });
};

exports.postAddProduct = (req,res,next)=>{
    const product = new Product(req.body.name);
    product.save();
    console.log(`Product added : ${product}`);
    res.redirect('/');
};

exports.getProduct = (req,res,next)=>{
    Product.fetchAll(products => {
        const hasProduct = products.length > 0 ? true : false;
        res.render('shop',{
            'title':'Nusantaran JS | Original Taste of Nusantara',
            'path':'/',
            'hasProduct': hasProduct,
            'products':products
        });
    });
};