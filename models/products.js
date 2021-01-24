const knex = require('knex');
const unique_id = require('uuid').v4;
const db_config = require('./db-config').config;
const db = knex(db_config);

module.exports = class Products {
    constructor(name, category, description, price){
        this.id = unique_id();
        this.name = name;
        this.category = category;
        this.description = description;
        this.price = price;
    }
    
    async save(){
        try {
            return db('products').returning('*').insert({
                id: this.id,
                name: this.name,
                category: this.category,
                description: this.description,
                price: this.price
            });
        }
        catch (error) {
            throw new Error(error);
        }
    }

    static async fetchAll(){
        try {
            const products = await db('products').select('*');
            return products;
        }
        catch (error) {
            throw new Error(error);
        }
    }

    static async findById(id){
        try {
            const products = await this.fetchAll();
            return products.find(p => p.id === id);
        }
        catch (error) {
            throw new Error(error);
        }
    }

    static async updateProduct(new_product){
        try {
            const products = await db('products').where('id', new_product.id).update({
                name: new_product.name,
                category: new_product.category,
                description: new_product.description,
                price: new_product.price
            });
            return products;
        }
        catch (error) {
            throw new Error(error);
        }
    }

    static async deleteProduct(id){
        try {
            const products = await db('products').where('id', id).del();
            return products;
        }
        catch (error) {
            throw new Error(error);
        }
    }
};