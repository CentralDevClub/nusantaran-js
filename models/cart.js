const knex = require('knex');
const db_config = require('./db-config').config;
const db = knex(db_config);


module.exports = class Cart {
    static addProduct(productID, owner, productPrice){
        db('cart').returning('*').insert({
            id:productID,
            qty:1,
            price:productPrice,
            owner:owner
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