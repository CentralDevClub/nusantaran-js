const Users = require('../models/users');


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
            console.log(user);
            if (user.password == req.body.password){
                console.log(`Successfully logged in - ${req.body.email}`);
                req.session.isAuthenticated = true;
                res.redirect('/');
            } else {
                console.log(`Wrong password for "${user.email}"`);
                res.redirect('/login');
            }
        } else {
            console.log('User not found');
            res.redirect('/login');
        }
    });
}

exports.postLogout = (req, res) =>{
    console.log("User logged out");
    req.session.destroy(err => {
        if (err){
            console.log(err);
        }
        res.redirect('/');
    });
}