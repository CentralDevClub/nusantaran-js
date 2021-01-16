const Product = require('../models/products')
const Cart = require('../models/cart')


// Product controllers
exports.getProductList = (req,res)=>{
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

exports.getProductDetail = (req,res) => {
    Product.findById(req.params.id,product=>{
        res.render('shop/products-detail',{
            'title':`Nusantaran JS | ${product.name}`,
            'path':`/products/${req.params.id}`,
            'product':product
        });
    });
};

exports.getIndex = (req,res)=>{
    res.render('shop/index',{
        'title':'Nusantaran JS | Welcome',
        'path':'/'
    });
};


// Cart controllers
exports.getCart = (req,res)=>{
    const owner = req.session.user.email;
    Cart.fetchAll(owner, cartProducts=>{
        Product.fetchAll(shopProducts=>{
            let products = []
            for (let prod of shopProducts){
                const inCart = cartProducts.find(p=>p.id === prod.id);
                if (inCart){
                    products.push({name:prod.name,id:prod.id,price:prod.price,qty:inCart.qty})
                }
            }
            let totalPrice = 0
            products.map(p=>totalPrice += (p.price*p.qty))

            const hasProduct = products.length > 0 ? true : false;
            res.render('shop/cart',{
                'title':'Nusantaran JS | Cart',
                'path':'/cart',
                'hasProduct':hasProduct,
                'products': products,
                'totalPrice':totalPrice
            });
        });
    });
};

exports.postCart = (req,res)=>{
    Cart.addProduct(req.body.productID, req.session.user.email, req.body.productPrice);
    res.redirect(req.body.path);
};

exports.postDeleteCart = (req,res)=>{
    Cart.deleteProduct(req.body.id, req.session.user.email, ()=>{
        res.redirect('/cart');
    });
};

exports.postUpdateQty = (req, res)=>{
    Cart.updateQty(req.body.id, req.body.qty, req.session.user.email, (product)=>{
        if (product[0].qty <= 0){
            Cart.deleteProduct(req.body.id, req.session.user.email, ()=>{
                res.redirect('/cart')
            });
        } else {
            res.redirect('/cart');
        }
    });
}


// Checkout controller
exports.getCheckout = (req,res)=>{
    res.render('shop/checkout',{
        'title':'Nusantaran JS | Checkout',
        'path':'/checkout'
    });
};