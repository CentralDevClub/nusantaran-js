const Users = require('../models/users');
const chalk = require('chalk');
const crypto = require('crypto');
const knex = require('knex');
const db_config = require('../models/db-config').config;
const db = knex(db_config);
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


exports.getUser = (req, res)=>{
    Users.findUserByEmail(req.session.user.email).then((users)=>{
        try {
            const user = users[0]
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
    const successFlash = req.flash('success');
    const error = req.flash('error');
    const errorMessage = error.length > 0 ? error[0] : null;
    const success = successFlash.length > 0 ? successFlash[0] : null;
    res.render('user/reset', {
        'title':'Nusantaran JS | Reset Password',
        'path':'/reset',
        'success': success,
        'errorMessage': errorMessage
    });
}

exports.postReset = (req, res)=>{
    crypto.randomBytes(32, (error, buffer)=>{
        if (error){
            res.status(500).redirect('/500');
        } else {
            const token = buffer.toString('hex');
            db('resettoken').returning('*').insert({
                useremail: req.body.email,
                token: token,
                expired: Date.now() + 3600000
            }).then(()=>{
                const email = {
                    to: req.body.email,
                    from: process.env.MAIL_SENDER,
                    subject: 'Nusantaran Reset User Password',
                    text: 'Reset password',
                    html: `<h2>Yoohoo</h2><p>Reset your password <a href="http://${process.env.IP_PUBLIC}/newpassword?email=${req.body.email}&token=${token}">here</a></p>`
                };
                sgMail.send(email).then(()=>{
                    req.flash('success', true);
                    res.status(200).redirect('/reset');
                }).catch(()=>{
                    res.status(500).redirect('/500');
                })
            }).catch(()=>{
                req.flash('success', false);
                req.flash('error', 'Email already sent, valid for one hour');
                res.status(200).redirect('/reset');
            });
        }
    });
}

exports.getNewPassword = (req, res)=>{
    const email = req.query.email
    const token = req.query.token;
    res.render('user/new-password', {
        'title':'Nusantaran JS | Set New Password',
        'path':'/newpassword',
        'token': token,
        'email': email
    });
}

exports.postNewPassword = (req, res)=>{
    const email = req.body.email
    const password = req.body.password;
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