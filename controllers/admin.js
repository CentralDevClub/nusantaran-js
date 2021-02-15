const chalk = require('chalk');
const Product = require('../models/products');
const { validationResult } = require('express-validator');
const fs = require('fs');
const itemPerPage = 10;


exports.getProduct = (req,res)=>{
    const page = req.query.page ? req.query.page -1 : 0;
    Product.fetchChunk(page, itemPerPage).then((productAndLength) => {
        const products = productAndLength.chunkData;
        const length = productAndLength.tableRowsCount;
        const totalPage = Math.ceil(length / itemPerPage);
        const placeholder = req.flash('placeholder');
        const placeholderData = placeholder.length > 0 ? placeholder[0] : {}
        const error = req.flash('errorMessage');
        const errorMessage = error.length > 0 ? error[0] : null
        const hasProduct = products.length > 0 ? true : false;
        const displayPage = totalPage >= itemPerPage ? true : false;
        const limit = {
            firstPage: 1,
            lastPage: totalPage
        }

        res.render('admin/product',{
            'title':'Nusantaran JS | Admin Products',
            'path':'/product',
            'hasProduct': hasProduct,
            'products': products,
            'errorMessage': errorMessage,
            'errors': req.flash('errors'),
            'placeholder': placeholderData,
            'page': page + 1,
            'totalPage': totalPage,
            'displayPage': true,
            'limit': limit
        });
    }).catch((error)=>{
        console.log(error);
        res.redirect('/500');
    });
};

exports.postAddProduct = (req, res)=>{
    const validationError = validationResult(req);
    if (validationError.isEmpty()){
        const product = new Product(
            req.body.name,
            req.body.category,
            req.body.description,
            req.body.price,
            req.file.path,
            req.session.user.email
        );
        product.save().then((product) => {
            console.log(chalk.blue(`Product added : ${product[0].name}`));
            res.redirect('/admin/product');
        }).catch(()=>{
            console.log(chalk.red('Insert Product Failed!'))
            console.log('Caught at controllers/admin.js:21')
            res.redirect('/500');
        });
    } else {
        try {
            fs.unlinkSync(req.file.path);
        } catch (error){
            console.log(error);
        };
        req.flash('errorMessage', validationError.array()[0].msg);
        req.flash('errors', validationError.array());
        req.flash('placeholder', {
            'name': req.body.name,
            'category': req.body.category,
            'description': req.body.description,
            'price': req.body.price
        });
        res.redirect('/admin/product');
    }
};

exports.postUpdateProduct = (req, res)=>{
    let product = req.body;
    product.image = req.file ? req.file.path : product.imagepath
    if (req.file){
        fs.unlinkSync(product.imagepath);
    }
    Product.updateProduct(product).then(()=> {
        res.redirect('/admin/product');
    }).catch((error)=>{
        console.log(error);
        res.redirect('/500');
    });
};

exports.postDeleteProduct = (req,res)=>{
    Product.deleteProduct(req.body.id).then(()=>{
        res.redirect('/admin/product');
    }).catch((error)=>{
        console.log(error);
        res.redirect('/500');
    });
};