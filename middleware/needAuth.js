module.exports = (req, res, next)=>{    
    if (!req.session.isAuthenticated){
        return res.status(404).redirect('/404')
    }
    next()
}