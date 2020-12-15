exports.get404 = (req,res)=>{
    res.render('404',{
        'title':'Nusantaran JS | Page Not Found',
        'path':'/404'
    });
};