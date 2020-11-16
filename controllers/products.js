const products = [];

exports.getAddProduct = (req,res,next)=>{
    res.render('add-product',{
        'title':'Nusantaran JS | Add Products',
        'path':'/add-product'
    });
};

exports.postAddProduct = (req,res,next)=>{
    let product = req.body.product;
    console.log(`Product added : ${product}`);
    products.push(product)
    res.redirect('/');
};

exports.getProduct = (req,res,next)=>{
    res.render('shop',{
        'title':'Nusantaran JS | Original Taste of Nusantara',
        'path':'/',
        'products':products
    });
};