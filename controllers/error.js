exports.get404 = (_req,res)=>{
    res.render('404',{
        'title':'Nusantaran JS | Page Not Found',
        'path':'/404'
    });
};