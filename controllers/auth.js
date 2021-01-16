require('dotenv').config;
const Users = require('../models/users');
const chalk = require('chalk');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


exports.getRegister = (req, res) => {
    res.render('auth/register', {
        'title':'Nusantaran JS | Register',
        'path':'/register',
        'errorMessage': req.flash('error')
    });
}

exports.getLogin = (req, res)=>{
    res.render('auth/login', {
        'title': 'Nusantaran JS | Login',
        'path': '/login',
        'errorMessage': req.flash('error')
    })
}

exports.postRegister = (req, res)=>{
    Users.addUser(req.body.name, req.body.address, req.body.email, req.body.password, result => {
        if (result == 'success'){
            const email = {
                to: req.body.email,
                from: process.env.MAIL_SENDER,
                subject: 'Nusantaran User Successfully Registered',
                text: 'and easy to do anywhere, even with Node.js',
                html: `<h2>Yoohoo</h2><p>Dear ${req.body.name}, your account on Nusantaran was successfully registered</p>`
            };
            sgMail.send(email).then(()=>{
                console.log(chalk.green(`Email Sent to ${req.body.email}`));
                res.redirect('/login');
            }).catch(err=>{
                if(err){
                    console.log(chalk.red(err));
                    res.redirect('/login');
                }
            });
        } else {
            req.flash('error', 'Email already used');
            res.redirect('/register');
        }
    });
}

exports.postLogin = (req, res)=>{
    Users.findUserByEmail(req.body.email, user => {
        if (user){
            console.log(chalk.blue(`User found ${user.email}`));
            bcrypt.compare(req.body.password, user.password, (err, success)=>{
                if (success){
                    console.log(chalk.green(`Successfully logged in - ${req.body.email}`));
                    req.session.user = user;
                    req.session.isAuthenticated = true;
                    res.redirect('/');
                } else {
                    console.log(chalk.red(`Wrong password for "${user.email}"`));
                    req.flash('error', 'Wrong password for this user');
                    res.redirect('/login');
                } 
            });
        } else {
            console.log(chalk.red('User not found'));
            req.flash('error', 'User not found. Please register');
            res.redirect('/login');
        }
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