const knex = require('knex')
const db_config = require('./db-config').config
const db = knex(db_config)
const bcrypt = require('bcrypt')
const bcryptSaltRounds = parseInt(process.env.SALT_ROUNDS)
const unique_id = require('uuid').v4


module.exports = class Users {
    static async allUser() {
        return await db('users').select('*')
    }

    static async addUser(name, image, address, email, password) {
        const salt = await bcrypt.genSalt(bcryptSaltRounds)
        const hash = await bcrypt.hash(password, salt)
        await db('users').returning('*').insert({
            name: name,
            image: image,
            address: address,
            email: email,
            password: hash,
            verified: false
        })
        return 'success'
    }

    static async findUserByEmail(email) {
        return await db('users').where('email', email)
    }

    static async updatePassword(email, password) {
        const salt = await bcrypt.genSalt(bcryptSaltRounds)
        const hash = await bcrypt.hash(password, salt)
        const user = await db('users').where('email', email).update({
            'password': hash
        }).returning('*').then((user) => {
            return user
        })
        return user
    }

    static async verifyAccount(email) {
        const user = await db('users').where('email', email).update({
            'verified': true
        }).returning('*').then((user) => {
            return user
        })
        return user
    }

    static async addOrder(email, product, payment, order_status) {
        const order = await db('orders').insert({
            'id': unique_id(),
            'email': email,
            'product': product,
            'payment': payment,
            'order_status': order_status,
            'date_order': Date.now()
        }).returning('*')
        return order
    }

    static async deleteOrder(id) {
        return await db('orders').del().where('id', id).returning('*')
    }

    static async getOrdersByEmail(email) {
        return await db('orders').where('email', email).select('*')
    }

    static async getOrderById(id) {
        return await db('orders').where('id', id).select('*')
    }

    static async getAllOrders() {
        return await db('orders').select('*')
    }

    static async updateStatus(id, order_status) {
        const order = await db('orders').where('id', id).update({
            'order_status': order_status
        }).returning('*').then((order) => {
            return order
        })
        return order
    }

    static async getWishlistByEmail(email) {
        return await db('wishlist').where('email', email).select('*')
    }

    static async getMyWishlist(email) {
        return await db.select('*')
            .from('products')
            .where('wishlist.email', email)
            .innerJoin('wishlist', 'products.id', 'wishlist.product_id')
    }

    static async addWishlist(productid, useremail) {
        const wishlist = await db('wishlist').insert({
            'id': unique_id(),
            'product_id': productid,
            'email': useremail
        }).returning('*')
        return wishlist
    }

    static async deleteWishlist(id) {
        const wishlist = await db('wishlist').del().where({
            'id': id
        }).returning('*')
        return wishlist
    }
}