const knex = require('knex');
const db_config = require('./db-config').config;
const db = knex(db_config);


module.exports = class Cart {
    static addProduct(productID, productPrice){
        db('cart').returning('*').insert({
            id:productID,
            qty:1,
            price:productPrice
        }).catch(error=>{
            if (error.code === '23505'){
                db('cart').where('id',productID).select('qty').then(cartQty=>{
                    db('cart').where('id',productID).update({
                        'qty':cartQty[0].qty+1
                    }).then(()=>{
                        console.log('Product Qty updated')
                    })
                })
            }
        }).then(()=>{
            console.log('Product added to cart')
        });
    }

    static fetchAll(callBack){
        db('cart').select('*').then(products=>{
            callBack(products)
        });
    }
};