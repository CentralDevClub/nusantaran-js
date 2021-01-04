const Product = require('../models/products');


exports.postAddProduct = (req,res)=>{
    const product = new Product(req.body.name,req.body.category,req.body.description,req.body.price);
    product.save();
    res.redirect('/admin/product');
};

exports.getProduct = (req,res)=>{
    Product.fetchAll(products => {
        const hasProduct = products.length > 0 ? true : false;
        res.render('admin/product',{
            'isAuthenticated': req.session.isAuthenticated,
            'title':'Nusantaran JS | Admin Products',
            'path':'/product',
            'hasProduct': hasProduct,
            'products':products
        });
    });
};

exports.postUpdateProduct = (req,res)=>{
    Product.updateProduct(req.body, ()=> {
        res.redirect('/admin/product');
    });
};

exports.postDeleteProduct = (req,res)=>{
    Product.deleteProduct(req.body.id, ()=>{
        res.redirect('/admin/product');
    });
};