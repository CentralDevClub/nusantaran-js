const knex = require('knex');
const db_config = require('./db-config').config;
const db = knex(db_config);
const chalk = require('chalk');


module.exports = class Cart {
    static async addProduct(productID, owner, productPrice){
        try {
            const products = await db('cart').where({
                'id': productID,
                'owner': owner
            });
            if (products.length > 0) {
                this.updateQty(productID, products[0].qty + 1, owner, () => { });
            }
            else {
                return db('cart').returning('*').insert({
                    id: productID,
                    qty: 1,
                    price: productPrice,
                    owner: owner
                }).then((cart) => {
                    console.log(chalk.blue(`${owner}: Product added to cart`));
                    return cart;
                }).catch((error) => {
                    throw new Error(error);
                });
            }
        }
        catch (error_1) {
            throw new Error(error_1);
        }
    }

    static async fetchAll(owner){
        const products = await db('cart').select('*').where('owner', owner);
        return products;
    }

    static async deleteProduct(id, owner){
        try {
            const products = await db('cart').where({
                'id': id,
                'owner': owner
            }).del();
            console.log(chalk.yellow(`${owner}: Product removed from cart`));
            return products;
        }
        catch (error) {
            throw new Error(error);
        }
    }

    static async updateQty(id, qty, owner){
        try {
            await db('cart').where({
                'id': id,
                'owner': owner
            }).update({
                'qty': qty
            });
            try {
                const product = await db('cart').where('id', id);
                console.log(chalk.blue(`${owner}: Product Qty updated --> ${qty}`));
                return product;
            }
            catch (error) {
                throw new Error(error);
            }
        }
        catch (error_1) {
            throw new Error(error_1);
        }
    }
};