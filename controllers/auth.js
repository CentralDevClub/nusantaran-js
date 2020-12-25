exports.getRegister = (req, res) => {
    res.render('auth/register', {
        'title':'Nusantaran JS | Register',
        'path':'/register'
    });
}

exports.getLogin = (req, res)=>{
    res.render('auth/login', {
        'title': 'Nusantaran JS | Login',
        'path': '/login'
    })
}