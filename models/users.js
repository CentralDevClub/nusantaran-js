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

    static async addUser(name, image, address, email, password, token) {
        const salt = await bcrypt.genSalt(bcryptSaltRounds)
        const hash = await bcrypt.hash(password, salt)
        return await db('users').returning('*').insert({
            name: name,
            image: image,
            address: address,
            email: email,
            password: hash,
            verified: false
        })
    }

    static async assignToken(email, token) {
        return await db('verifytoken').returning('*').insert({
            email: email,
            token: token,
            expired: Date.now() + 3600000
        })
    }

    static async statusVerify(email) {
        return await db('verifytoken').where('email', email)
    }

    static async updateToken(email, token) {
        return await db('verifytoken').where('email', email).update({
            token: token,
            expired: Date.now() + 3600000
        })
    }

    static async verifyAccount(email) {
        return await db('users').where('email', email).returning('*').update({ 'verified': true })
    }

    static async findUserByEmail(email) {
        return await db('users').where('email', email)
    }

    static async updatePassword(email, password) {
        const salt = await bcrypt.genSalt(bcryptSaltRounds)
        const hash = await bcrypt.hash(password, salt)
        return await db('users').where('email', email).returning('*').update({ 'password': hash })
    }

    static async getResetTokenByEmail(email) {
        return await db('resettoken').where('useremail', email)
    }

    static async setResetToken(email, token) {
        return await db('resettoken').returning('*').insert({
            useremail: email,
            token: token,
            expired: Date.now() + 3600000
        })
    }

    static async updateResetToken(email, token) {
        return await db('resettoken').where('useremail', email).update({
            token: token,
            expired: Date.now() + 3600000
        })
    }

    static async deleteResetToken(email) {
        return await db('resettoken').where('useremail', email).del()
    }

    static async addOrder(email, product, payment, order_status) {
        return await db('orders').insert({
            'id': unique_id(),
            'email': email,
            'product': product,
            'payment': payment,
            'order_status': order_status,
            'date_order': Date.now()
        }).returning('*')
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
        return await db('orders').where('id', id).update({
            'order_status': order_status
        }).returning('*')
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
        return await db('wishlist').insert({
            'id': unique_id(),
            'product_id': productid,
            'email': useremail
        }).returning('*')
    }

    static async deleteWishlist(id) {
        return await db('wishlist').del().where({
            'id': id
        }).returning('*')
    }

    static async getAdmins() {
        return await db('administrator').select('*')
    }

    static async getAdminByEmail(email) {
        return await db('administrator').where('email', email).select('*')
    }
}