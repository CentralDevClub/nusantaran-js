const Users = require('../models/users');
const Product = require('../models/products');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const chalk = require('chalk');
const crypto = require('crypto');
const knex = require('knex');
const db_config = require('../models/db-config').config;
const { validationResult } = require('express-validator');
const db = knex(db_config);
const Email = require('../emails/emails');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


exports.getUser = (req, res)=>{
    Users.findUserByEmail(req.session.user.email).then((users)=>{
        try {
            const user = users[0];
            res.render('user/profile',{
                'title':`Nusantaran JS | My Account`,
                'path':`/profile`,
                'user': user
            })
        } catch (error) {
            console.log(error);
            res.status(500).redirect('/500');
        }
    }).catch(()=>{
        res.status(500).redirect('/500');
    });
};

exports.postLogout = (req, res) =>{
    console.log(chalk.yellow(`${req.session.user.email}: logged out`));
    req.session.destroy(err => {
        if (err){
            console.log(chalk.red('Error Found'));
            console.log(err);
        }
        res.status(200).redirect('/');
    });
}

exports.getReset = (req, res)=>{
    const error = req.flash('errorMessage');
    const errorMessage = error.length > 0 ? error[0] : null;
    const messageFLash = req.flash('message');
    const message = messageFLash.length > 0 ? messageFLash[0] : null;
    res.render('user/reset', {
        'title':'Nusantaran JS | Reset Password',
        'path':'/reset',
        'message': message,
        'errorMessage': errorMessage,
        'errors':[],
        'placeholder':{
            'name': null,
            'email':null,
            'address':null
        }
    });
}

exports.postReset = (req, res)=>{
    const validationError = validationResult(req);
    if (!validationError.isEmpty()){
        return res.status(422).render('user/reset', {
            'title':'Nusantaran JS | Reset Password',
            'path':'/reset',
            'message': null,
            'errorMessage': validationError.array()[0].msg,
            'errors': validationError.array(),
            'placeholder':{
                'email': req.body.email
            }
        });
    }
    db('users').where('email', req.body.email).then((users)=>{
        if (!users.length > 0){
            return res.status(422).render('user/reset', {
                'title':'Nusantaran JS | Reset Password',
                'path':'/reset',
                'message': null,
                'errorMessage': 'Email is not registered',
                'errors': [{param: 'email'}],
                'placeholder':{
                    'email': req.body.email
                }
            });
        }
        crypto.randomBytes(32, (error, buffer)=>{
            if (error){
                res.status(500).redirect('/500');
            } else {
                const token = buffer.toString('hex');
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
                };
                db('resettoken').returning('*').insert({
                    useremail: req.body.email,
                    token: token,
                    expired: Date.now() + 3600000
                }).then(()=>{
                    sgMail.send(email).then(()=>{
                        req.flash('message', 'Email has been sent, token is valid for one hour, please check your email');
                        res.status(200).redirect('/reset');
                    }).catch((err)=>{
                        console.log(err);
                        res.status(500).redirect('/500');
                    })
                }).catch(()=>{
                    db('resettoken').where('useremail', req.body.email).update({
                        token: token,
                        expired: Date.now() + 3600000
                    }).then(()=>{
                        sgMail.send(email).then(()=>{
                            req.flash('message', 'Expiration token has been updated to 1 hour, please check your email');
                            res.status(200).redirect('/reset');
                        }).catch((err)=>{
                            console.log(err);
                            res.status(500).redirect('/500');
                        })
                    }).catch((err)=>{
                        console.log(err);
                        res.status(500).redirect('/500');
                    });
                });
            }
        });
    });
}

exports.getNewPassword = (req, res)=>{
    const email = req.query.email;
    const token = req.query.token;
    if (email === undefined || token === undefined){
        return res.status(404).redirect('/404');
    }
    const error = req.flash('errorMessage');
    const errorMessage = error.length > 0 ? error[0] : null;
    db('resettoken').where('useremail', email).then((users)=>{
        if (users.length === 0){
            throw new Error('User not found');
        } else {
            const user = users[0];
            let error = null;
            if (token == user.token){
                if (user.expired < Date.now()){
                    error = 'Sorry, your token is expired';
                }
            } else {
                error = 'Wrong token for this user';
            }
            res.render('user/new-password', {
                'title':'Nusantaran JS | Set New Password',
                'path':'/newpassword',
                'token': token,
                'email': email,
                'error': error,
                'errorMessage': errorMessage,
                'errors':[]
            });
        }
    }).catch((err)=>{
        console.log(err);
        res.render('user/new-password', {
            'title':'Nusantaran JS | Set New Password',
            'path':'/newpassword',
            'token': token,
            'email': email,
            'error': 'Sorry, the user you are looking for is not found',
            'errorMessage': errorMessage,
            'errors':[]
        });
    });
}

exports.postNewPassword = (req, res)=>{
    const email = req.body.email;
    const token = req.body.token;
    if (email === undefined || token === undefined){
        return res.status(404).redirect('/404');
    }
    const validationError = validationResult(req);
    const password = req.body.password;
    if (!validationError.isEmpty()){
        return res.status(422).render('user/new-password', {
            'title':'Nusantaran JS | Set New Password',
            'path':'/newpassword',
            'errorMessage': validationError.array()[0].msg,
            'errors': validationError.array(),
            'error': null,
            'token': token,
            'email': email
        });
    }
    Users.updatePassword(email, password).then((users)=>{
        const user = users[0];
        db('resettoken').where('useremail', user.email).del().then(()=>{
            res.status(200).redirect('/profile');
        }).catch((error)=>{
            console.log(error);
            res.status(500).redirect('/500');
        });
    }).catch((error)=>{
        console.log(error);
        res.status(500).redirect('/500');
    });
}

exports.getMyOrder = (req, res)=>{
    db('administrator').where('email', req.session.user.email).select('*').then((admins)=>{
        const admin = admins.length > 0 ? admins[0].email : false;
        const isAdmin = admin == req.session.user.email ? true : false;
        const orders = isAdmin ? Users.getAllOrders() : Users.getOrdersByEmail(req.session.user.email);
        orders.then((orders)=>{
            const hasOrder = orders.length > 0 ? true : false;
            res.status(200).render('user/myorder', {
                'title':'Nusantaran JS | My Order History',
                'path':'/myorder',
                'hasOrder': hasOrder,
                'orders': Array.from(orders)
            });
        }).catch((err)=>{
            console.log(err);
            res.status(500).redirect('/500');
        });
    }).catch((err)=>{
        console.log(err);
        res.status(500).redirect('/500');
    });
}

exports.getWishlist = (req, res)=>{
    Users.getWishlistByEmail(req.session.user.email).then((wishlist)=>{
        const hasWishlist = wishlist.length > 0 ? true : false;
        if (!hasWishlist){
            return res.status(200).render('user/wishlist', {
                'title':'Nusantaran JS | My Wishlist',
                'path':'/wishlist',
                'hasWishlist': false,
                'wishlist': []
            });
        }
        Product.fetchAll().then((shopProducts)=>{
            let products = [];
            for (let prod of shopProducts){
                const inWishlist = wishlist.find(p => p.product_id === prod.id);
                if (inWishlist){
                    products.push({
                        name:prod.name,
                        id:prod.id,
                        price:prod.price,
                        category: prod.category,
                        image: prod.image,
                        wishlistid: inWishlist.id
                    })
                }
            }
            res.status(200).render('user/wishlist', {
                'title':'Nusantaran JS | My Wishlist',
                'path':'/wishlist',
                'hasWishlist': true,
                'wishlist': products
            });
        }).catch((err)=>{
            console.log(err);
            res.status(500).redirect('/500');
        });
    }).catch((err)=>{
        console.log(err);
        res.status(500).redirect('/500');
    });
}

exports.postAddWishlist = (req, res) =>{
    Users.addWishlist(req.body.productid, req.session.user.email).then(()=>{
        res.status(200).redirect('/wishlist');
    }).catch((err)=>{
        console.log(err);
        res.status(500).redirect('/500');
    });
}

exports.postDeleteWishlist = (req, res)=>{
    Users.deleteWishlist(req.body.id).then(()=>{
        res.status(200).redirect('/wishlist');
    }).catch((err)=>{
        console.log(err);
        res.status(500).redirect('/500');
    });
}

exports.getInvoice = (req, res, next)=>{
    const orderId = req.params.orderId;
    const invoiceName = 'invoice-' + Date.now() + '-' + orderId + '.pdf';
    const invoicePath = path.join('invoices', invoiceName);

    Users.getOrderById(orderId).then((orders)=>{
        const orderFound = orders.length > 0 ? true : false;
        const order = orderFound ? orders[0] : null;

        if (!orderFound){
            return next(new Error('Order is not found'));
        }
        if (order.email !== req.session.user.email){
            if (!req.session.isAdmin){
                return next(new Error('Unauthorized access for invoice order'));
            }
        }
        const pdf = new PDFDocument();
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
        pdf.pipe(fs.createWriteStream(invoicePath));
        pdf.pipe(res);
        pdf.fontSize(26).text('Nusantaran Order Invoice');
        pdf.fontSize(20).text(order.id);
        pdf.text('\n');
        pdf.fontSize(16).text(`Author : ${order.email}`);
        pdf.fontSize(16).text(`Payment : Rp. ${order.payment}`);
        pdf.fontSize(16).text(`Status : ${order.order_status}`);
        pdf.fontSize(16).text(`Time Occured : ${Date(order.date_order).toString()}`);
        pdf.text('\n');
        pdf.fontSize(16).text('Products Ordered :');
        for (let product of JSON.parse(order.product)){
            pdf.fontSize(16).text(`${product.name} (Rp. ${product.price}) x ${product.qty}`);
        }
        pdf.end();
    }).catch((err)=>{
        next(err);
    });
}