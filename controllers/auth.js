require('dotenv').config;
const Users = require('../models/users');
const chalk = require('chalk');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


exports.getRegister = (req, res) => {
    const error = req.flash('errorMessage')
    const message = error.length > 0 ? error[0] : null
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
    const error = req.flash('errorMessage');
    const success = req.flash('successMessage');
    const successMessage = success.length > 0 ? success[0] : null;
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
    Users.addUser(req.body.name, req.body.address, req.body.email, req.body.password).then(() => {
        const email = {
            to: req.body.email,
            from: process.env.MAIL_SENDER,
            subject: 'Nusantaran User Successfully Registered',
            text: `Dear ${req.body.name}. Successfuly signed up on Nusantaran. You can go login`,
            html: `<h2>Yoohoo</h2><p>Dear ${req.body.name}, your account on Nusantaran was successfully registered. You can go login now</p>`
        };
        sgMail.send(email).then(()=>{
            console.log(chalk.green(`Email Sent to ${req.body.email}`));
            req.flash('successMessage', 'Successfully signed up. Please check your email. Check spam folder too');
            res.redirect('/login');
        }).catch(err=>{
            console.log(chalk.red(err));
            req.flash('successMessage', 'Successfully signed up. You can go login')
            res.redirect('/login');
        });
    }).catch(()=>{
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
    });
}

exports.postLogin = (req, res)=>{
    Users.findUserByEmail(req.body.email).then((user)=>{
        console.log(chalk.blue(`User found ${user.email}`));
        try {
            bcrypt.compare(req.body.password, user.password).then((success)=>{
                if (success){
                    console.log(chalk.green(`Successfully logged in - ${req.body.email}`));
                    req.session.user = user;
                    req.session.isAuthenticated = true;
                    res.redirect('/');
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
        } catch (error) {
            console.log(error);
            res.redirect('/500');
        }
    }).catch(()=>{
        console.log(chalk.red('User not found'));
        req.flash('errorMessage', 'User not found. Please register');
        req.flash('placeholder', req.body.email);
        req.flash('errors', {'param':'email'});
        res.redirect('/login');
    });
}

exports.postLogout = (req, res) =>{
    console.log(chalk.yellow(`${req.session.user.email}: logged out`));
    req.session.destroy(err => {
        if (err){
            console.log(chalk.red('Error Found'));
            console.log(err);
        }
        res.redirect('/');
    });
}