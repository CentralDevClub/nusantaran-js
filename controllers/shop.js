const Product = require('../models/products')
const Cart = require('../models/cart')


// Product controllers
exports.getProductList = (_req,res)=>{
    Product.fetchAll().then((products)=>{
        const hasProduct = products.length > 0 ? true : false;
        res.render('shop/products-list',{
            'title':'Nusantaran JS | Original Taste of Nusantara',
            'path':'/products',
            'hasProduct': hasProduct,
            'products':products
        });
    }).catch((error)=>{
        console.log(error);
        res.redirect('/500');
    });
};

exports.getProductDetail = (req,res) => {
    Product.findById(req.params.id).then((product) =>{
        res.render('shop/products-detail',{
            'title':`Nusantaran JS | ${product.name}`,
            'path':`products/${req.params.id}`,
            'product':product
        });
    }).catch((error)=>{
        console.log(error);
        res.redirect('/500');
    });
};

exports.getIndex = (_req,res)=>{
    res.render('shop/index',{
        'title':'Nusantaran JS | Welcome',
        'path':'/'
    });
};


// Cart controllers
exports.getCart = (req,res)=>{
    const owner = req.session.user.email;
    Cart.fetchAll(owner).then((cartProducts)=>{
        Product.fetchAll().then((shopProducts)=>{
            // Filter product contain in cart
            let products = []
            for (let prod of shopProducts){
                const inCart = cartProducts.find(p=>p.id === prod.id);
                if (inCart){
                    products.push({name:prod.name,id:prod.id,price:prod.price,qty:inCart.qty})
                }
            }

            // Calculating total price
            let totalPrice = 0
            products.forEach((p) => {
                totalPrice += (p.price * p.qty);
            });

            const hasProduct = products.length > 0 ? true : false;
            res.status(200).render('shop/cart',{
                'title':'Nusantaran JS | Cart',
                'path':'/cart',
                'hasProduct':hasProduct,
                'products': products,
                'totalPrice':totalPrice
            });
        }).catch((error)=>{
            console.log(error);
            res.redirect('/500');
        });
    }).catch((error)=>{
        console.log(error);
        res.redirect('/500');
    });
};

exports.postCart = (req,res)=>{
    Cart.addProduct(req.body.productID, req.session.user.email, req.body.productPrice).then(()=>{
        res.redirect('/cart');
    }).catch(()=>{
        console.log('Catch at controllers/shop.js:84');
        res.redirect('/500');
    });
};

exports.postDeleteCart = (req,res)=>{
    Cart.deleteProduct(req.body.id, req.session.user.email).then(()=>{
        res.redirect('/cart');
    }).catch((error)=>{
        console.log('Catch at controllers/shop.js:93');
        res.redirect('/500');
    });
};

exports.postUpdateQty = (req, res)=>{
    Cart.updateQty(req.body.id, req.body.qty, req.session.user.email).then((product)=>{
        if (product[0].qty <= 0){
            Cart.deleteProduct(req.body.id, req.session.user.email).then(()=>{
                res.redirect('/cart')
            });
        } else {
            res.redirect('/cart');
        }
    }).catch((error)=>{
        console.log('Catch at controllers/shop.js:108');
        res.redirect('/500');
    });
}


// Checkout controller
exports.getCheckout = (_req,res)=>{
    res.render('shop/checkout',{
        'title':'Nusantaran JS | Checkout',
        'path':'/checkout'
    });
};