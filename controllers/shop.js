const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const User = require('../models/users')
const Product = require('../models/products')
const Cart = require('../models/cart')
const itemPerPage = 10


// Product controllers
exports.getProductList = (req, res, next) => {
    const page = req.query.page ? req.query.page - 1 : 0
    Product.fetchChunk(page, itemPerPage).then((productAndLength) => {
        const products = productAndLength.chunkData
        const length = productAndLength.tableRowsCount
        const totalPage = Math.ceil(length / itemPerPage)
        const hasProduct = products.length > 0 ? true : false
        const displayPage = totalPage > 1 ? true : false
        const limit = {
            firstPage: 1,
            lastPage: totalPage
        }

        res.status(200).render('shop/products-list', {
            'title': 'Nusantaran JS | Shop',
            'path': '/products',
            'hasProduct': hasProduct,
            'products': products,
            'page': page + 1,
            'totalPage': totalPage,
            'displayPage': displayPage,
            'limit': limit
        })
    }).catch((error) => {
        console.log(error)
        next(error)
    })
}

exports.getProductDetail = (req, res, next) => {
    Product.findById(req.params.id).then((product) => {
        res.status(200).render('shop/products-detail', {
            'title': `Nusantaran JS | ${product.name}`,
            'path': `products/${req.params.id}`,
            'product': product
        });
    }).catch((error) => {
        console.log(error)
        next(error)
    })
}

exports.getIndex = (_req, res) => {
    res.status(200).render('shop/index', {
        'title': 'Nusantaran JS | Welcome! Enjoy The Original Taste of Nusantara',
        'path': '/'
    })
}


// Cart controllers
exports.getCart = (req, res, next) => {
    const owner = req.session.user.email
    Cart.fetchAll(owner).then((cartProducts) => {
        Product.fetchAll().then((shopProducts) => {
            // Filter product contain in cart
            let products = []
            for (let prod of shopProducts) {
                const inCart = cartProducts.find(p => p.id === prod.id)
                if (inCart) {
                    products.push({
                        name: prod.name,
                        id: prod.id,
                        price: prod.price,
                        qty: inCart.qty,
                        image: prod.image
                    })
                }
            }

            // Calculating total price
            let totalPrice = 0
            products.forEach((p) => {
                totalPrice += (p.price * p.qty)
            })

            const hasProduct = products.length > 0 ? true : false
            res.status(200).render('shop/cart', {
                'title': 'Nusantaran JS | Cart',
                'path': '/cart',
                'hasProduct': hasProduct,
                'products': products,
                'totalPrice': totalPrice
            })
        }).catch((error) => {
            console.log(error)
            next(error)
        });
    }).catch((error) => {
        console.log(error)
        next(error)
    })
}

exports.postCart = (req, res, next) => {
    Cart.addProduct(req.body.productID, req.session.user.email, req.body.productPrice).then(() => {
        res.status(200).redirect('/cart')
    }).catch((error) => {
        console.log(error)
        next(error)
    })
}

exports.postDeleteCart = (req, res, next) => {
    Cart.deleteProduct(req.body.id, req.session.user.email).then(() => {
        res.status(200).redirect('/cart')
    }).catch((error) => {
        console.log(error)
        next(error)
    })
}

exports.postCartTruncate = (req, res, next) => {
    Cart.emptyCart(req.session.user.email).then(() => {
        res.status(200).redirect('/cart')
    }).catch((error) => {
        console.log(error)
        next(error)
    })
}

exports.postUpdateQty = (req, res, next) => {
    Cart.updateQty(req.body.id, req.body.qty, req.session.user.email).then((products) => {
        const product = products[0]
        if (product.qty <= 0) {
            Cart.deleteProduct(req.body.id, req.session.user.email).then(() => {
                res.status(200).redirect('/cart')
            }).catch((error) => {
                console.log(error)
                next(error)
            })
        } else {
            res.status(200).redirect('/cart')
        }
    }).catch((error) => {
        console.log(error)
        next(error)
    });
}


// Checkout controller
exports.getCheckout = (req, res, next) => {
    const getProducts = async (paid, owner) => {
        if (!paid) {
            const orders = req.flash('order')
            const order = orders.length > 0 ? orders[0] : false
            if (order) {
                await User.deleteOrder('id', order.id)
            }
        }

        const cartProducts = await Cart.fetchAll(owner)
        const shopProducts = await Product.fetchAll()

        let products = []
        for (let prod of shopProducts) {
            const inCart = cartProducts.find(p => p.id === prod.id)
            if (inCart) {
                products.push({
                    name: prod.name,
                    id: prod.id,
                    price: prod.price,
                    qty: inCart.qty,
                    image: prod.image
                })
            }
        }

        let totalPrice = 0
        products.forEach((p) => {
            totalPrice += (p.price * p.qty)
        })

        const hasProduct = products.length > 0 ? true : false
        res.status(200).render('shop/checkout', {
            'title': 'Nusantaran JS | Checkout',
            'path': '/checkout',
            'hasProduct': hasProduct,
            'products': products,
            'totalPrice': totalPrice,
            'source': process.env.STRIPE_PUBLISHABLE_KEY,
            'paid': paid ? true : false
        })
    }

    const owner = req.session.user.email
    const checkoutId = req.flash('checkoutId')
    const check = checkoutId.length > 0 ? true : false
    try {
        if (check) {
            stripe.checkout.sessions.retrieve(checkoutId[0]).then((data) => {
                const paid = data.payment_status === 'paid' ? true : false
                if (!paid) {
                    getProducts(paid, owner)
                } else {
                    // If user have paid the products then empty user cart
                    Cart.emptyCart(owner).then(() => {
                        res.status(200).render('shop/checkout', {
                            'title': 'Nusantaran JS | Checkout',
                            'path': '/checkout',
                            'paid': paid ? true : false
                        })
                    }).catch((error) => {
                        console.log(error)
                        next(error)
                    })
                }
            })
        } else {
            getProducts(false, owner)
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

exports.postCheckout = async (req, res, next) => {
    try {
        const cartProducts = await Cart.fetchAll(req.session.user.email)
        const shopProducts = await Product.fetchAll()

        // Products Data
        let products = []
        for (let prod of shopProducts) {
            const inCart = cartProducts.find(p => p.id === prod.id)
            if (inCart) {
                products.push({
                    name: prod.name,
                    id: prod.id,
                    price: prod.price,
                    qty: inCart.qty,
                    image: prod.image
                })
            }
        }

        let totalPrice = 0
        products.forEach((p) => {
            totalPrice += (p.price * p.qty)
        })

        User.addOrder(req.session.user.email, JSON.stringify(products), totalPrice, 'Waiting for shipment').then(async (orders) => {
            // Stripe object products
            const stripeProducts = products.map((product) => {
                return {
                    price_data: {
                        currency: 'idr',
                        product_data: {
                            name: product.name,
                            images: [`http://${process.env.IP_PUBLIC}/${product.image.replace(/ /g, "%20")}`]
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
                metadata: { description: 'Nusantaran products payment' }
            })

            if (session.id) {
                const order = orders.length > 0 ? orders[0] : false
                req.flash('order', order)
                req.flash('checkoutId', session.id)
                res.json({ id: session.id })
            }
        }).catch((error) => {
            console.log(error)
            next(error)
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}
