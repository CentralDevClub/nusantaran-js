const knex = require('knex')
const unique_id = require('uuid').v4
const db_config = require('./db-config').config
const db = knex(db_config)
const fs = require('fs')


module.exports = class Products {
    constructor(name, category, description, price, image) {
        this.id = unique_id()
        this.name = name
        this.category = category
        this.description = description
        this.price = price
        this.image = image
    }

    async save() {
        return db('products').returning('*').insert({
            id: this.id,
            name: this.name,
            category: this.category,
            description: this.description,
            price: this.price,
            image: this.image
        })
    }

    static async fetchAll() {
        return await db('products').select('*')
    }

    static async fetchChunk(page, limit) {
        const products = await db('products').count('id').then(async (size) => {
            const length = size[0].count
            const prods = await db('products').select('*').limit(limit).offset(page * limit)
            return {
                chunkData: prods,
                tableRowsCount: length
            }
        })
        return products
    }

    static async findById(id) {
        const products = await this.fetchAll()
        return products.find(p => p.id === id)
    }

    static async updateProduct(new_product) {
        return await db('products').where('id', new_product.id).update({
            name: new_product.name,
            image: new_product.image,
            category: new_product.category,
            description: new_product.description,
            price: new_product.price
        })
    }

    static async deleteProduct(id) {
        return await db('products').del().where('id', id).returning('*').then((product) => {
            fs.unlinkSync(product[0].image)
        })
    }
}