const Users = require('../models/users');
const chalk = require('chalk');


exports.getRegister = (req, res) => {
    res.render('auth/register', {
        'isAuthenticated': req.session.isAuthenticated,
        'title':'Nusantaran JS | Register',
        'path':'/register'
    });
}

exports.getLogin = (req, res)=>{
    res.render('auth/login', {
        'isAuthenticated': req.session.isAuthenticated,
        'title': 'Nusantaran JS | Login',
        'path': '/login'
    })
}

exports.postRegister = (req, res)=>{
    Users.addUser(req.body.name, req.body.address, req.body.email, req.body.password);
    res.redirect('/login');
}

exports.postLogin = (req, res)=>{
    Users.findUserByEmail(req.body.email, user => {
        if (user){
            console.log(chalk.underline.blue(`User found ${user.email}`));
            if (user.password == req.body.password){
                console.log(chalk.underline.green(`Successfully logged in - ${req.body.email}`));
                req.session.isAuthenticated = true;
                req.session.user = user
                res.redirect('/');
            } else {
                console.log(chalk.underline.red(`Wrong password for "${user.email}"`));
                res.redirect('/login');
            }
        } else {
            console.log(chalk.underline.red('User not found'));
            res.redirect('/login');
        }
    });
}

exports.postLogout = (req, res) =>{
    console.log(chalk.underline.yellow('User logged out'));
    req.session.destroy(err => {
        if (err){
            console.log(chalk.underline.red('Error Found'));
            console.log(err);
        }
        res.redirect('/');
    });
}