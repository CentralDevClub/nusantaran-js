const chalk = require('chalk');
const sanitize = require('sanitize-filename');
const Product = require('../models/products');
const User = require('../models/users');
const { validationResult } = require('express-validator');
const fs = require('fs');
const itemPerPage = 10;


const sanitizeImage = (oldPath)=>{
    return 'images/' + sanitize(oldPath.split('\\')[1]);
}


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
        const displayPage = totalPage * itemPerPage >= itemPerPage ? true : false;
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
            'displayPage': displayPage,
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
        const safeImage = sanitizeImage(req.file.path);
        const product = new Product(
            req.body.name,
            req.body.category,
            req.body.description,
            req.body.price,
            safeImage,
            req.session.user.email
        );
        product.save().then((product) => {
            console.log(chalk.blue(`Product added : ${product[0].name}`));
            res.redirect('/admin/product');
        }).catch(()=>{
            console.log(chalk.red('Product name is already have'));
            req.flash('errorMessage', [`Product "${req.body.name}" is already in database`]);
            req.flash('errors', [{param:'name'}]);
            req.flash('placeholder', {
                'name': req.body.name,
                'category': req.body.category,
                'description': req.body.description,
                'price': req.body.price
            })
            res.status(422).redirect('/admin/product');
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
    product.image = req.file ? sanitizeImage(req.file.path) : sanitizeImage(product.imagepath);
    if (req.file){
        try {
            fs.unlinkSync(product.imagepath);
        } catch(err){
            console.log(err);
        }
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

exports.postChangeStatus = (req, res)=>{
    const id = req.body.id;
    const status = req.body.status;
    User.updateStatus(id, status).then(()=>{
        res.status(200).redirect('/myorder');
    }).catch((err)=>{
        console.log(err);
        res.status(500).redirect('/500');
    })
}