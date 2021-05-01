const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const ash = require('express-async-handler')
const User = require('../models/users')
const Product = require('../models/products')
const Cart = require('../models/cart')
const itemPerPage = 10


// Product controllers
exports.getProductList = ash(async (req, res) => {
    const page = req.query.page ? req.query.page - 1 : 0
    const productAndLength = await Product.fetchChunk(page, itemPerPage)
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
})

exports.getProductDetail = ash(async (req, res) => {
    const product = await Product.findById(req.params.id)
    res.status(200).render('shop/products-detail', {
        'title': `Nusantaran JS | ${product.name}`,
        'path': `products/${req.params.id}`,
        'product': product
    });
})

exports.getIndex = (_req, res) => {
    res.status(200).render('shop/index', {
        'title': 'Nusantaran JS | Welcome! Enjoy The Original Taste of Nusantara',
        'path': '/'
    })
}


// Cart controllers
exports.getCart = ash(async (req, res) => {
    const owner = req.session.user.email
    const products = await Cart.fetchByOwner(owner)
    const hasProduct = products.length > 0 ? true : false
    const totalPrice = products.map(p => p.price * p.qty).reduce((a, b) => a + b, 0)

    res.status(200).render('shop/cart', {
        'title': 'Nusantaran JS | Cart',
        'path': '/cart',
        'hasProduct': hasProduct,
        'products': products,
        'totalPrice': totalPrice
    })
})

exports.postCart = ash(async (req, res) => {
    await Cart.addProduct(req.body.productID, req.session.user.email, req.body.productPrice)
    res.status(200).redirect('/cart')
})

exports.postDeleteCart = ash(async (req, res) => {
    await Cart.deleteProduct(req.body.id, req.session.user.email)
    res.status(200).redirect('/cart')
})

exports.postCartTruncate = ash(async (req, res) => {
    await Cart.emptyCart(req.session.user.email)
    res.status(200).redirect('/cart')
})

exports.postUpdateQty = ash(async (req, res) => {
    const products = await Cart.updateQty(req.body.id, req.body.qty, req.session.user.email)
    const product = products[0]
    if (product.qty <= 0) {
        await Cart.deleteProduct(req.body.id, req.session.user.email)
    }
    res.status(200).redirect('/cart')
})


// Checkout controller
exports.getCheckout = ash(async (req, res) => {
    const getProducts = async (paid, owner) => {
        // If the user is not paid the order from stripe, then delete user's order in database
        if (!paid) {
            const orders = req.flash('order')
            const order = orders.length > 0 ? orders[0] : false
            if (order) {
                await User.deleteOrder('id', order.id)
            }
        }

        const products = await Cart.fetchByOwner(owner)
        const hasProduct = products.length > 0 ? true : false
        const totalPrice = products.map(p => p.price * p.qty).reduce((a, b) => a + b, 0)

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

    const checkoutId = req.flash('checkoutId')
    const check = checkoutId.length > 0 ? true : false
    const owner = req.session.user.email
    if (check) {
        const data = await stripe.checkout.sessions.retrieve(checkoutId[0])
        const paid = data.payment_status === 'paid' ? true : false
        if (!paid) {
            getProducts(paid, owner)
        } else {
            // If user have paid the products then empty user cart
            await Cart.emptyCart(owner)
            res.status(200).render('shop/checkout', {
                'title': 'Nusantaran JS | Checkout',
                'path': '/checkout',
                'paid': paid ? true : false
            })
        }
    } else {
        getProducts(false, owner)
    }
})

exports.postCheckout = ash(async (req, res) => {
    const owner = req.session.user.email
    const products = await Cart.fetchByOwner(owner)
    const totalPrice = products.map(p => p.price * p.qty).reduce((a, b) => a + b, 0)
    const orders = await User.addOrder(req.session.user.email, JSON.stringify(products), totalPrice, 'Waiting for shipment')
    
    // Create Stripe product object - Change code with caution, read the stripe's docs first
    // Don't touch if you do not fully understand
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
})