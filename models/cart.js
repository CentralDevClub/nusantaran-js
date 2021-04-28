const knex = require('knex')
const db_config = require('./db-config').config
const db = knex(db_config)

module.exports = class Cart {
    static async addProduct(productID, owner, productPrice) {
        const products = await db('cart').where({
            'id': productID,
            'owner': owner
        })

        if (products.length > 0) {
            this.updateQty(productID, products[0].qty + 1, owner)
        } else {
            return db('cart').returning('*').insert({
                id: productID,
                qty: 1,
                price: productPrice,
                owner: owner
            }).then((cart) => {
                return cart
            })
        }
    }

    static async fetchAll(owner) {
        return await db('cart').select('*').where('owner', owner)
    }

    static async emptyCart(owner) {
        const products = await db('cart').where({
            'owner': owner
        }).del()
        return products
    }

    static async deleteProduct(id, owner) {
        const products = await db('cart').where({
            'id': id,
            'owner': owner
        }).del()
        return products
    }

    static async updateQty(id, qty, owner) {
        await db('cart').where({
            'id': id,
            'owner': owner
        }).update({
            'qty': qty
        })
        return await db('cart').where('id', id)
    }
}