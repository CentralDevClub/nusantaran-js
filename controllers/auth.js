require('dotenv').config;
const Users = require('../models/users');
const knex = require('knex');
const db_config = require('../models/db-config').config;
const db = knex(db_config);
const chalk = require('chalk');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const Email = require('../emails/emails');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


exports.getRegister = (req, res) => {
    const error = req.flash('errorMessage');
    const message = error.length > 0 ? error[0] : null;
    res.render('auth/register', {
        'title':'Nusantaran JS | Register',
        'path':'/register',
        'errorMessage': message,
        'errors':[],
        'placeholder':{
            'name': null,
            'email':null,
            'address':null
        }
    });
}

exports.getLogin = (req, res)=>{
    const success = req.flash('successMessage');
    const successMessage = success.length > 0 ? success[0] : null;
    const error = req.flash('errorMessage');
    const message = error.length > 0 ? error[0] : null;
    res.render('auth/login', {
        'title': 'Nusantaran JS | Login',
        'path': '/login',
        'errorMessage': message,
        'successMessage': successMessage,
        'errors': req.flash('errors'),
        'placeholder': req.flash('placeholder')[0]
    })
}

exports.postRegister = (req, res)=>{
    const validationError = validationResult(req);
    if (!validationError.isEmpty()){
        return res.status(422).render('auth/register', {
            'title':'Nusantaran JS | Register',
            'path':'/register',
            'errorMessage': validationError.array()[0].msg,
            'errors': validationError.array(),
            'placeholder':{
                'name': req.body.name,
                'email': req.body.email,
                'address':req.body.address
            }
        });
    }

    Users.addUser(req.body.name, req.file.path, req.body.address, req.body.email, req.body.password).then(() => {
        crypto.randomBytes(32, (error, buffer)=>{
            if (error){
                res.status(500).redirect('/500');
            } else {
                const token = buffer.toString('hex');
                const email = {
                    to: req.body.email,
                    from: process.env.MAIL_SENDER,
                    subject: 'Nusantaran User Successfully Registered',
                    text: `Dear ${req.body.name}. Successfuly signed up on Nusantaran. You can go login`,
                    html: Email.getEmail({
                        'emailTitle': 'Nusantaran User Registration',
                        'emailText': 'Welcome to Nusantaran. Your account is successfully registered to Nusantaran. Please verify your account by clicking the button down below. Please notice that this link is only valid for 1 hour start from this email is sent. Thank you',
                        'buttonLink': `http://${process.env.IP_PUBLIC}/verified?email=${req.body.email}&token=${token}`,
                        'buttonText': 'Verify Account'
                    })
                };

                db('verifytoken').returning('*').insert({
                    email: req.body.email,
                    token: token,
                    expired: Date.now() + 3600000
                }).then(()=>{
                    sgMail.send(email).then(()=>{
                        console.log(chalk.green(`Email Sent to ${req.body.email}`));
                        req.flash('successMessage', 'Successfully signed up. Please check your email and verify your account');
                        res.redirect('/login');
                    }).catch(err=>{
                        console.log(chalk.red(err));
                        res.status(500).redirect('/500');
                    });
                }).catch(()=>{
                    db('verifytoken').where('email', req.body.email).update({
                        token: token,
                        expired: Date.now() + 3600000
                    }).then(()=>{
                        sgMail.send(email).then(()=>{
                            req.flash('successMessage', 'Expiration token has been updated to 1 hour, please check your email');
                            res.status(200).redirect('/login');
                        }).catch(()=>{
                            res.status(500).redirect('/500');
                        })
                    }).catch((err)=>{
                        console.log(err);
                        res.status(500).redirect('/500');
                    });
                });
            }
        });
    }).catch((err)=>{
        console.log(err);
        db('users').select('*').where('email', req.body.email).then((users)=>{
            const user = users[0];
            if (user.verified === true){
                return res.status(422).render('auth/register', {
                    'title':'Nusantaran JS | Register',
                    'path':'/register',
                    'errorMessage': 'Email already used, try another one',
                    'errors': [{'param':'email'}],
                    'placeholder':{
                        'name': req.body.name,
                        'email': req.body.email,
                        'address':req.body.address
                    }
                });
            } else {
                crypto.randomBytes(32, (error, buffer)=>{
                    if (error){
                        res.status(500).redirect('/500');
                    } else {
                        const token = buffer.toString('hex');
                        const email = {
                            to: req.body.email,
                            from: process.env.MAIL_SENDER,
                            subject: 'Nusantaran User Successfully Registered',
                            text: `Dear ${req.body.name}. Successfuly signed up on Nusantaran. You can go login`,
                            html: Email.getEmail({
                                'emailTitle': 'Nusantaran User Registration',
                                'emailText': 'Welcome to Nusantaran. Your account is successfully registered to Nusantaran. Please verify your account by clicking the button down below. Please notice that this link is only valid for 1 hour start from this email is sent. Thank you',
                                'buttonLink': `http://${process.env.IP_PUBLIC}/verified?email=${req.body.email}&token=${token}`,
                                'buttonText': 'Verify Account'
                            })
                        };
                        db('verifytoken').where('email', req.body.email).update({
                            token: token,
                            expired: Date.now() + 3600000
                        }).then(()=>{
                            sgMail.send(email).then(()=>{
                                req.flash('successMessage', 'Expiration token has been updated to 1 hour, please check your email');
                                res.status(200).redirect('/login');
                            }).catch(()=>{
                                res.status(500).redirect('/500');
                            })
                        });
                    }
                });
            }
        }).catch((err)=>{
            console.log(err);
            res.status(500).redirect('/500');
        });
    });
}

exports.getVerified = (req, res)=>{
    const email = req.query.email;
    const token = req.query.token;
    db('verifytoken').where('email', email).then((users)=>{
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

            Users.verifyAccount(email).then(()=>{
                res.render('auth/verified', {
                    'title':'Nusantaran JS | Verify Account',
                    'path':'/verified',
                    'error': error
                });
            }).catch((err)=>{
                console.log(err);
                res.status(500).redirect('/500');
            });
        }
    }).catch(()=>{
        res.render('user/new-password', {
            'title':'Nusantaran JS | Set New Password',
            'path':'/newpassword',
            'token': token,
            'email': email,
            'error': 'Sorry, the user you are looking for is not found'
        });
    });
}

exports.postLogin = (req, res)=>{
    Users.findUserByEmail(req.body.email).then((users)=>{
        try {
            const user = users[0]
            console.log(chalk.blue(`User found ${user.email}`));
            if (user.verified == true){
                bcrypt.compare(req.body.password, user.password).then((success)=>{
                    if (success){
                        console.log(chalk.green(`Successfully logged in - ${req.body.email}`));
                        req.session.user = user;
                        req.session.isAuthenticated = true;
                        db('administrator').select('*').then((admins)=>{
                            if (admins){
                                for (const admin of admins){
                                    if (req.body.email === admin.email){
                                        req.session.isAdmin = true;
                                    }
                                }
                            }
                            res.redirect('/')
                        }).catch(()=>{
                            console.log('Catch at : models/auth.js:110');
                            res.redirect('/500');
                        });
                    } else {
                        throw new Error(`Wrong password for "${user.email}"`);
                    }
                }).catch((error)=>{
                    console.log(chalk.red(error));
                    req.flash('errorMessage', 'Wrong password for this user');
                    req.flash('placeholder', req.body.email);
                    req.flash('errors', {'param':'password'});
                    res.redirect('/login');
                })
            } else {
                req.flash('errorMessage', 'User is not verified. Check your email and verify your account');
                req.flash('placeholder', req.body.email);
                req.flash('errors', {'param':'email'});
                res.redirect('/login');
            }
        } catch (error) {
            throw new Error(error);
        }
    }).catch(()=>{
        console.log(chalk.red('User not found'));
        req.flash('errorMessage', 'User not found. Please register');
        req.flash('placeholder', req.body.email);
        req.flash('errors', {'param':'email'});
        res.redirect('/login');
    });
}