const Product = require('../models/products')
const Cart = require('../models/cart')


// Product controllers
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
            'path':`/products/${req.params.id}`,
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


// Cart controllers
exports.getCart = (req,res,next)=>{
    Cart.fetchAll(cartProducts=>{
        Product.fetchAll(shopProducts=>{
            let products = []
            for (prod of shopProducts){
                const inCart = cartProducts.find(p=>p.id === prod.id);
                if (inCart){
                    products.push({name:prod.name,price:prod.price,qty:inCart.qty})
                }
            }
            let totalPrice = 0
            products.map(p=>totalPrice += (p.price*p.qty))

            res.render('shop/cart',{
                'title':'Nusantaran JS | Cart',
                'path':'/cart',
                'hasProduct':true,
                'products': products,
                'totalPrice':totalPrice
            });
        });
    });
};

exports.postCart = (req,res,next)=>{
    Cart.addProduct(req.body.productID,req.body.productPrice)
    res.redirect(req.body.path);
};


// Checkout controller
exports.getCheckout = (req,res,next)=>{
    res.render('shop/checkout',{
        'title':'Nusantaran JS | Checkout',
        'path':'/checkout'
    });
};