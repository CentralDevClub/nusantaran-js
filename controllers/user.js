const Users = require('../models/users')
const Product = require('../models/products')
const fs = require('fs')
const path = require('path')
const sanitize = require('sanitize-filename')
const PDFDocument = require('pdfkit')
const crypto = require('crypto')
const knex = require('knex')
const db_config = require('../models/db-config').config
const { validationResult } = require('express-validator')
const ash = require('express-async-handler')
const db = knex(db_config)
const Email = require('../emails/emails')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


exports.getUser = ash(async (req, res) => {
    const users = await Users.findUserByEmail(req.session.user.email)
    const user = users[0]
    res.render('user/profile', {
        'title': `Nusantaran JS | My Account`,
        'path': `/profile`,
        'user': user
    })
})

exports.postLogout = (req, res, next) => {
    req.session.destroy((error) => {
        if (error) {
            console.log(error)
            next(error)
        }
        res.status(200).redirect('/')
    })
}

exports.getReset = (req, res) => {
    const error = req.flash('errorMessage')
    const errorMessage = error.length > 0 ? error[0] : null
    const messageFLash = req.flash('message')
    const message = messageFLash.length > 0 ? messageFLash[0] : null
    res.render('user/reset', {
        'title': 'Nusantaran JS | Reset Password',
        'path': '/reset',
        'message': message,
        'errorMessage': errorMessage,
        'errors': [],
        'placeholder': {
            'name': null,
            'email': null,
            'address': null
        }
    })
}

exports.postReset = ash(async (req, res, next) => {
    const validationError = validationResult(req)
    if (!validationError.isEmpty()) {
        return res.status(422).render('user/reset', {
            'title': 'Nusantaran JS | Reset Password',
            'path': '/reset',
            'message': null,
            'errorMessage': validationError.array()[0].msg,
            'errors': validationError.array(),
            'placeholder': {
                'email': req.body.email
            }
        })
    }

    // Check if email is not inside our users table database
    const users = await db('users').where('email', req.body.email)
    if (!users.length > 0) {
        return res.status(422).render('user/reset', {
            'title': 'Nusantaran JS | Reset Password',
            'path': '/reset',
            'message': null,
            'errorMessage': 'Email is not registered',
            'errors': [{ param: 'email' }],
            'placeholder': {
                'email': req.body.email
            }
        })
    }

    crypto.randomBytes(32, async (error, buffer) => {
        if (error) {
            console.log(error)
            next(error)
        } else {
            const token = buffer.toString('hex')
            const email = {
                to: req.body.email,
                from: process.env.MAIL_SENDER,
                subject: 'Nusantaran Reset User Password',
                text: 'Reset password',
                html: Email.getEmail({
                    'emailTitle': 'Nusantaran Account Reset Password',
                    'emailText': 'Hello, you can reset your password by clicking the button down below. Please notice that this link is only valid for one hour after you recieved this email. Thank you.',
                    'buttonLink': `http://${process.env.IP_PUBLIC}/newpassword?email=${req.body.email}&token=${token}`,
                    'buttonText': 'Set New Password'
                })
            }

            try {
                await db('resettoken').returning('*').insert({
                    useremail: req.body.email,
                    token: token,
                    expired: Date.now() + 3600000
                })
                await sgMail.send(email)
                req.flash('message', 'Email has been sent, token is valid for one hour, please check your email')
                res.status(200).redirect('/reset')
            } catch (error) {
                await db('resettoken').where('useremail', req.body.email).update({
                    token: token,
                    expired: Date.now() + 3600000
                })
                await sgMail.send(email)
                req.flash('message', 'Expiration token has been updated to 1 hour, please check your email')
                res.status(200).redirect('/reset')
            }
        }
    })
})

exports.getNewPassword = ash(async (req, res) => {
    const email = req.query.email
    const token = req.query.token
    if (email === undefined || token === undefined) {
        return res.status(404).redirect('/404')
    }
    const error = req.flash('errorMessage')
    const errorMessage = error.length > 0 ? error[0] : null
    const users = await db('resettoken').where('useremail', email)
    const user = users[0]

    if (users.length === 0) {
        error = 'Sorry, the user you are looking for is not found'
    } else {
        if (token == user.token) {
            if (user.expired < Date.now()) {
            }
        } else {
        }
    }
    res.render('user/new-password', {
        'title': 'Nusantaran JS | Set New Password',
        'path': '/newpassword',
        'token': token,
        'email': email,
        'error': error,
        'errorMessage': errorMessage,
        'errors': []
    })
})

exports.postNewPassword = ash(async (req, res) => {
    const email = req.body.email
    const token = req.body.token
    if (email === undefined || token === undefined) {
        return res.status(404).redirect('/404')
    }
    const validationError = validationResult(req)
    const password = req.body.password
    if (!validationError.isEmpty()) {
        return res.status(422).render('user/new-password', {
            'title': 'Nusantaran JS | Set New Password',
            'path': '/newpassword',
            'errorMessage': validationError.array()[0].msg,
            'errors': validationError.array(),
            'error': null,
            'token': token,
            'email': email
        })
    }
    const users = await Users.updatePassword(email, password)
    const user = users[0]
    await db('resettoken').where('useremail', user.email).del()
    res.status(200).redirect('/profile')
})

exports.getMyOrder = ash(async (req, res) => {
    const admins = await db('administrator').where('email', req.session.user.email).select('*')
    const isAdmin = admins.map(admin => admin.email).includes(req.session.user.email)
    const orderFunction = isAdmin ? Users.getAllOrders() : Users.getOrdersByEmail(req.session.user.email)
    const orders = await orderFunction
    const hasOrder = orders.length > 0 ? true : false
    res.status(200).render('user/myorder', {
        'title': 'Nusantaran JS | My Order History',
        'path': '/myorder',
        'hasOrder': hasOrder,
        'orders': Array.from(orders)
    })
})

exports.getWishlist = ash(async (req, res) => {
    let wishlist = await Users.getMyWishlist(req.session.user.email)
    const hasWishlist = wishlist.length > 0 ? true : false
    if (!hasWishlist) {
        wishlist = []
    }

    res.status(200).render('user/wishlist', {
        'title': 'Nusantaran JS | My Wishlist',
        'path': '/wishlist',
        'hasWishlist': hasWishlist,
        'wishlist': wishlist
    })
})

exports.postAddWishlist = ash(async (req, res) => {
    const owner = req.session.user.email
    const product = req.body.productid
    const wishlist = await Users.getWishlistByEmail(owner)
    const haveProduct = wishlist.map(p => p.product_id).includes(product)
    if (!haveProduct) {
        await Users.addWishlist(product, owner)
    }
    res.status(200).redirect('/wishlist')
})

exports.postDeleteWishlist = ash(async (req, res) => {
    await Users.deleteWishlist(req.body.id)
    res.status(200).redirect('/wishlist')
})

exports.getInvoice = ash(async (req, res) => {
    const orderId = req.params.orderId
    const invoiceName = sanitize('invoice-' + Date.now() + '-' + orderId + '.pdf')
    const invoicePath = path.join('invoices', invoiceName)
    const orders = await Users.getOrderById(orderId)
    const orderFound = orders.length > 0 ? true : false
    const order = orderFound ? orders[0] : null

    if (!orderFound) {
        throw new Error('Order is not found')
    }
    if (order.email !== req.session.user.email) {
        if (!req.session.isAdmin) {
            throw new Error('Unauthorized access for invoice order')
        }
    }

    const pdf = new PDFDocument()
    pdf.pipe(fs.createWriteStream(invoicePath))
    pdf.pipe(res)
    pdf.fontSize(26).text('Nusantaran Order Invoice')
    pdf.fontSize(20).text(order.id)
    pdf.text('\n')
    pdf.fontSize(16).text(`Author : ${order.email}`)
    pdf.fontSize(16).text(`Payment : Rp. ${order.payment}`)
    pdf.fontSize(16).text(`Status : ${order.order_status}`)
    pdf.fontSize(16).text(`Time Occured : ${Date(order.date_order).toString()}`)
    pdf.text('\n')
    pdf.fontSize(16).text('Products Ordered :')
    for (let product of JSON.parse(order.product)) {
        pdf.fontSize(16).text(`${product.name} (Rp. ${product.price}) x ${product.qty}`)
    }
    pdf.end()
})