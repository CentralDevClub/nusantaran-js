const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/products');
const Cart = require('../models/cart');
const itemPerPage = 10;


// Product controllers
exports.getProductList = (req, res)=>{
    const page = req.query.page ? req.query.page -1 : 0;
    Product.fetchChunk(page, itemPerPage).then((productAndLength)=>{
        const products = productAndLength.chunkData;
        const length = productAndLength.tableRowsCount;
        const totalPage = Math.ceil(length / itemPerPage);
        const hasProduct = products.length > 0 ? true : false;
        
        const displayPage = totalPage >= itemPerPage ? true : false;
        const limit = {
            firstPage: 1,
            lastPage: totalPage
        }
        res.render('shop/products-list',{
            'title':'Nusantaran JS | Shop',
            'path':'/products',
            'hasProduct': hasProduct,
            'products': products,
            'page': page + 1,
            'displayPage': displayPage,
            'totalPage': totalPage,
            'limit': limit,
            'currentUser': req.session ? req.session.user.email : null
        });
    }).catch((error)=>{
        console.log(error);
        res.redirect('/500');
    })
}

exports.getProductDetail = (req, res) => {
    Product.findById(req.params.id).then((product) =>{
        res.render('shop/products-detail',{
            'title':`Nusantaran JS | ${product.name}`,
            'path':`products/${req.params.id}`,
            'product':product,
            'currentUser': req.session ? req.session.user.email : null
        });
    }).catch((error)=>{
        console.log(error);
        res.redirect('/500');
    })
}

exports.getIndex = (_req, res)=>{
    res.render('shop/index',{
        'title':'Nusantaran JS | Welcome! Enjoy The Original Taste of Nusantara',
        'path':'/'
    })
}


// Cart controllers
exports.getCart = (req, res)=>{
    const owner = req.session.user.email;
    Cart.fetchAll(owner).then((cartProducts)=>{
        Product.fetchAll().then((shopProducts)=>{
            // Filter product contain in cart
            let products = []
            for (let prod of shopProducts){
                const inCart = cartProducts.find(p => p.id === prod.id);
                if (inCart){
                    products.push({
                        name:prod.name,
                        id:prod.id,
                        price:prod.price,
                        qty:inCart.qty,
                        image: prod.image
                    })
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
    })
}

exports.postCart = (req, res)=>{
    Cart.addProduct(req.body.productID, req.session.user.email, req.body.productPrice).then(()=>{
        res.redirect('/cart');
    }).catch(()=>{
        console.log('Catch at controllers/shop.js:84');
        res.redirect('/500');
    })
}

exports.postDeleteCart = (req, res)=>{
    Cart.deleteProduct(req.body.id, req.session.user.email).then(()=>{
        res.redirect('/cart');
    }).catch(()=>{
        console.log('Catch at controllers/shop.js:93');
        res.redirect('/500');
    })
}

exports.postUpdateQty = (req, res)=>{
    Cart.updateQty(req.body.id, req.body.qty, req.session.user.email).then((product)=>{
        if (product[0].qty <= 0){
            Cart.deleteProduct(req.body.id, req.session.user.email).then(()=>{
                res.redirect('/cart')
            });
        } else {
            res.redirect('/cart');
        }
    }).catch(()=>{
        console.log('Catch at controllers/shop.js:108');
        res.redirect('/500');
    });
}


// Checkout controller
exports.getCheckout = (req, res)=>{
    const checkout = req.flash('checkout');
    const success = checkout.length > 0 ? true : false;
    const owner = req.session.user.email;
    if (!success){
        Cart.fetchAll(owner).then((cartProducts)=>{
            Product.fetchAll().then((shopProducts)=>{
                let products = []
                for (let prod of shopProducts){
                    const inCart = cartProducts.find(p => p.id === prod.id);
                    if (inCart){
                        products.push({
                            name:prod.name,
                            id:prod.id,
                            price:prod.price,
                            qty:inCart.qty,
                            image: prod.image
                        })
                    }
                }
    
                // Calculating total price
                let totalPrice = 0
                products.forEach((p) => {
                    totalPrice += (p.price * p.qty);
                });
    
                const hasProduct = products.length > 0 ? true : false;
                res.status(200).render('shop/checkout',{
                    'title':'Nusantaran JS | Checkout',
                    'path':'/checkout',
                    'hasProduct':hasProduct,
                    'products': products,
                    'totalPrice':totalPrice,
                    'source': process.env.STRIPE_PUBLISHABLE_KEY,
                    'success': success ? true : false
                });
            }).catch((error)=>{
                console.log(error);
                res.redirect('/500');
            });
        }).catch((error)=>{
            console.log(error);
            res.redirect('/500');
        });
    } else {
        Cart.emptyCart(owner).then(()=>{
            res.status(200).render('shop/checkout',{
                'title':'Nusantaran JS | Checkout',
                'path':'/checkout',
                'success': success ? true : false
            });
        }).catch((error)=>{
            console.log(error);
            res.redirect('/500');
        });
    }
}

exports.postCheckout = async (req, res)=>{
    const cartProducts = await Cart.fetchAll(req.session.user.email);
    const shopProducts = await Product.fetchAll();
    
    // Products Data
    let products = []
    for (let prod of shopProducts){
        const inCart = cartProducts.find(p => p.id === prod.id);
        if (inCart){
            products.push({
                name:prod.name,
                id:prod.id,
                price:prod.price,
                qty:inCart.qty,
                image: prod.image
            })
        }
    }

    // Stripe object products
    const stripeProducts = products.map((product)=>{
        return {
            price_data: {
                currency: 'idr',
                product_data: {
                    name: product.name,
                    // images: [`http://${process.env.IP_PUBLIC}/${product.image}`]
                    images: ['https://www.flaticon.com/svg/static/icons/svg/2111/2111505.svg']
                },
                unit_amount: product.price * 100
            },
            quantity: product.qty
        }
    })

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: stripeProducts,
        mode: 'payment',
        success_url: `http://${process.env.IP_PUBLIC}/checkout`,
        cancel_url: `http://${process.env.IP_PUBLIC}/checkout`,
        metadata: {description: 'Nusantaran products payment'}
    });

    if (session.id){
        req.flash('checkout', true);
        res.json({id: session.id});
    }
}