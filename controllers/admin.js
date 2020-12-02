const Product = require('../models/products');

exports.getAddProduct = (req,res,next)=>{
    res.render('admin/add-product',{
        'title':'Nusantaran JS | Add Products',
        'path':'/add-product'
    });
};

exports.postAddProduct = (req,res,next)=>{
    const product = new Product(req.body.name);
    product.save();
    console.log(`Product added : ${product}`);
    res.redirect('/products-list');
};

exports.getProduct = (req,res,next)=>{
    Product.fetchAll(products => {
        const hasProduct = products.length > 0 ? true : false;
        res.render('admin/product',{
            'title':'Nusantaran JS | Admin Products',
            'path':'/product',
            'hasProduct': hasProduct,
            'products':products
        });
    });
};