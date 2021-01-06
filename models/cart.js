const knex = require('knex');
const db_config = require('./db-config').config;
const db = knex(db_config);
const chalk = require('chalk');


module.exports = class Cart {
    static addProduct(productID, owner, productPrice){
        db('cart').where('id',productID).then(products=>{
            if (products.length > 0){
                const qty = products[0].qty
                db('cart').where('id',productID).update({
                    'qty': qty + 1
                }).then(()=>{
                    console.log(chalk.underline.blue(`Product Qty updated ${qty} --> ${qty + 1}`));
                })
            } else {
                db('cart').returning('*').insert({
                    id:productID,
                    qty:1,
                    price:productPrice,
                    owner:owner
                }).then(()=>{
                    console.log(chalk.underline.blue('Product added to cart'));
                });
            }
        })
    }

    static fetchAll(owner, callBack){
        db('cart').select('*').where('owner', owner).then(products=>{
            callBack(products);
        });
    }

    static deleteProduct(id, owner, callBack){
        db('cart').where({
            'id':id,
            'owner':owner
        }).del().then(products=>{
            callBack(products);
        });
    }

    static updateQty(id, qty, owner, callBack){
        db('cart').where({
            'id':id,
            'owner':owner
        }).update({
            'qty': qty
        }).then(()=>{
            db('cart').where('id',id).then(product=>{
                callBack(product);
            });
        });
    }
};