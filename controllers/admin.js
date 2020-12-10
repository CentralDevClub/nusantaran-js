const Product = require('../models/products');

exports.getAddProduct = (req,res,next)=>{
    res.render('admin/add-product',{
        'title':'Nusantaran JS | Add Products',
        'path':'/add-product'
    });
};

exports.postAddProduct = (req,res,next)=>{
    const product = new Product(req.body.name,req.body.category,req.body.description,req.body.price);
    product.save();
    res.redirect('/products');
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

exports.postUpdateProduct = (req,res,next)=>{
    Product.updateProduct(req.body, products=> {
        res.redirect('/admin/product');
    });
};

exports.postDeleteProduct = (req,res,next)=>{
    Product.deleteProduct(req.body.id, products=>{
        res.redirect('/admin/product');
    });
};