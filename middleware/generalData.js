module.exports = (req, res, next)=>{
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.isAdmin = req.session.isAdmin;
    res.locals.csrfToken = req.csrfToken();
    next();
}