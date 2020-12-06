const Product = require('../models/products')
const Cart = require('../models/cart')

exports.getProductList = (req,res,next)=>{
    Product.fetchAll(products => {
        const hasProduct = products.length > 0 ? true : false;
        res.render('shop/products-list',{
            'title':'Nusantaran JS | Original Taste of Nusantara',
            'path':'/products',
            'hasProduct': hasProduct,
            'products':products
        });
    });
};

exports.getProductDetail = (req,res,next) => {
    Product.findById(req.params.id,product=>{
        res.render('shop/products-detail',{
            'title':`Nusantaran JS | ${product.name}`,
            'path':'/product/detail',
            'product':product
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
    Cart.fetchAll(cart => {
        res.render('shop/cart',{
            'title':'Nusantaran JS | Cart',
            'path':'/cart',
            'hasProduct':true,
            'products': cart.products,
            'totalPrice':cart.totalPrice
        });
    });
};

exports.postCart = (req,res,next)=>{
    Cart.addProduct(req.body.productID,req.body.productPrice)
    res.redirect('/products');
};

exports.getCheckout = (req,res,next)=>{
    res.render('shop/checkout',{
        'title':'Nusantaran JS | Checkout',
        'path':'/checkout'
    });
};