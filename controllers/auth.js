require('dotenv').config
const Users = require('../models/users')
const bcrypt = require('bcrypt')
const generateToken = require('../util/generateToken')
const { validationResult } = require('express-validator')
const ash = require('express-async-handler')
const Email = require('../emails/emails')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


exports.getRegister = (req, res) => {
    const error = req.flash('errorMessage')
    const message = error.length > 0 ? error[0] : null
    res.render('auth/register', {
        'title': 'Nusantaran JS | Register',
        'path': '/register',
        'errorMessage': message,
        'errors': [],
        'placeholder': {
            'name': null,
            'email': null,
            'address': null
        }
    })
}

exports.getLogin = (req, res) => {
    const success = req.flash('successMessage')
    const successMessage = success.length > 0 ? success[0] : null
    const error = req.flash('errorMessage')
    const message = error.length > 0 ? error[0] : null
    res.render('auth/login', {
        'title': 'Nusantaran JS | Login',
        'path': '/login',
        'errorMessage': message,
        'successMessage': successMessage,
        'errors': req.flash('errors'),
        'placeholder': req.flash('placeholder')[0]
    })
}

exports.postRegister = ash(async (req, res) => {
    const validationError = validationResult(req)
    if (!validationError.isEmpty()) {
        return res.status(422).render('auth/register', {
            'title': 'Nusantaran JS | Register',
            'path': '/register',
            'errorMessage': validationError.array()[0].msg,
            'errors': validationError.array(),
            'placeholder': {
                'name': req.body.name,
                'email': req.body.email,
                'address': req.body.address
            }
        })
    }

    const token = await generateToken()
    const userEmail = req.body.email
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
    }

    try {
        await Users.assignToken(userEmail, token)
        await Users.addUser(req.body.name, req.file.path, req.body.address, userEmail, req.body.password)
        await sgMail.send()
        req.flash('successMessage', 'Successfully signed up. Please check your email and verify your account')
        res.status(200).redirect('/login')
    } catch (error) {
        const con = error.constraint
        if (con == 'verifytoken_email_key' || con == 'users_email_key') {
            // If failed to insert data to verifytoken or users database
            const users = await Users.findUserByEmail(userEmail)
            const user = users[0]
            if (user.verified) {
                // If the email is already registered and verified
                return res.status(422).render('auth/register', {
                    'title': 'Nusantaran JS | Register',
                    'path': '/register',
                    'errorMessage': 'Email is already registered',
                    'errors': [],
                    'placeholder': {
                        'name': req.body.name,
                        'email': req.body.email,
                        'address': req.body.address
                    }
                })
            } else {
                // If email is registered but not yet verified
                await Users.updateToken(userEmail, token)
                await sgMail.send(email)
                req.flash('successMessage', 'Expiration token has been updated to 1 hour, please check your email')
                res.status(200).redirect('/login')
            }
        } else {
            throw error
        }
    }
})

exports.getVerified = ash(async (req, res) => {
    const email = req.query.email
    const token = req.query.token
    const users = await Users.getVerifyToken(email)
    if (users.length === 0) {
        // If email specified is not in users database
        res.status(404).redirect('/404')
    } else {
        const user = users[0]
        let error = null
        if (token == user.token) {
            if (user.expired < Date.now()) {
                error = 'Sorry, your token is expired. Please register again'
            }
        } else {
            // If email is in database but incorrect token
            res.status(404).redirect('/404')
        }

        await Users.verifyAccount(email)
        res.render('auth/verified', {
            'title': 'Nusantaran JS | Verify Account',
            'path': '/verified',
            'error': error
        })
    }
})

exports.postLogin = ash(async (req, res) => {
    const users = await Users.findUserByEmail(req.body.email)
    const user = users ? users[0] : false

    // If user is not found
    if (!user) {
        req.flash('errorMessage', 'User not found. Please register')
        req.flash('placeholder', req.body.email)
        req.flash('errors', { 'param': 'email' })
        res.redirect('/login')
    }

    // If user is found but account status is not verified
    if (!user.verified) {
        req.flash('errorMessage', 'User is not verified. Check your email and verify your account')
        req.flash('placeholder', req.body.email)
        req.flash('errors', { 'param': 'email' })
        res.redirect('/login')
    }

    // If user is found and verified but enter wrong password
    const correctPassword = await bcrypt.compare(req.body.password, user.password)
    if (!correctPassword) {
        req.flash('errorMessage', 'Wrong password for this user')
        req.flash('placeholder', req.body.email)
        req.flash('errors', { 'param': 'password' })
        res.redirect('/login')
    }

    // Just fine
    req.session.user = user
    req.session.isAuthenticated = true
    req.session.isAdmin = false
    const admins = await Users.getAdmins()
    const isAdmin = admins.map(a => a.email).includes(req.body.email)
    if (isAdmin) {
        req.session.isAdmin = true
    }
    res.redirect('/')
})