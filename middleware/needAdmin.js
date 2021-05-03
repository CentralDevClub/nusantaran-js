module.exports = (req, res, next)=>{
    if (!req.session.isAdmin){
        return res.status(404).redirect('/404')
    }
    next()
}