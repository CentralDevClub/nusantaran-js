module.exports = (req, res, next)=>{
    res.locals.isAuthenticated = req.session.isAuthenticated;
    if (req.session.user){
        res.locals.username = req.session.user.name;
    }
    res.locals.csrfToken = req.csrfToken();
    next();
}