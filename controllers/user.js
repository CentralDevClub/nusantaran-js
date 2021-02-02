const Users = require('../models/users');


exports.getUser = (req, res)=>{
    Users.findUserByEmail(req.session.user.email).then((user)=>{
        res.render('profile',{
            'title':`Nusantaran JS | My Account`,
            'path':`/profile`,
            'user': user
        })
    }).catch(()=>{
        res.status(500).redirect('/500');
    });
};