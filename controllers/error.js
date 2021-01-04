exports.get404 = (req,res)=>{
    res.render('404',{
        'isAuthenticated': req.session.isAuthenticated,
        'title':'Nusantaran JS | Page Not Found',
        'path':'/404'
    });
};