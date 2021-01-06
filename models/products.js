const knex = require('knex');
const unique_id = require('uuid').v4;
const db_config = require('./db-config').config;
const db = knex(db_config);
const chalk = require('chalk');


const getProducts = (cb)=>{
    db('products').select('*').then(products=>{
        cb(products);
    });
};

module.exports = class Products {
    constructor(name, category, description, price){
        this.id = unique_id();
        this.name = name;
        this.category = category;
        this.description = description;
        this.price = price;
    }
    
    save(){
        db('products').returning('*').insert({
            id: this.id,
            name: this.name,
            category: this.category,
            description: this.description,
            price: this.price
        }).then(product=>{
            console.log(chalk.underline.blue(`Product added : ${product.name}`));
        });
    }

    static fetchAll(callBack){
        getProducts(products=>{
            callBack(products);
        });
    }

    static findById(id,callBack){
        getProducts(products => {
            const product = products.find(p => p.id === id);
            callBack(product);
        });
    }

    static updateProduct(new_product, callBack){
        db('products').where('id',new_product.id).update({
            name:new_product.name,
            category:new_product.category,
            description:new_product.description,
            price:new_product.price
        }).then(products=>{
            callBack(products);
        });
    }

    static deleteProduct(id, callBack){
        db('products').where('id',id).del().then(products=>{
            callBack(products);
        })
    }
};