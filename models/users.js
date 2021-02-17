const knex = require('knex');
const db_config = require('./db-config').config;
const db = knex(db_config);
const chalk = require('chalk');
const bcrypt = require('bcrypt');
const bcryptSaltRounds = parseInt(process.env.SALT_ROUNDS);
const unique_id = require('uuid').v4;


module.exports = class Users{
    static async allUser(){
        try {
            const user = await db('users').select('*');
            return user;
        }
        catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    static async addUser(name, image, address, email, password){             
        try {
            const salt = await bcrypt.genSalt(bcryptSaltRounds);
            const hash = await bcrypt.hash(password, salt);
            await db('users').returning('*').insert({
                name: name,
                image: image,
                address: address,
                email: email,
                password: hash,
                verified: false
            });
            console.log(chalk.green('User successfully registered'));
            return 'success';
        }
        catch (e) {
            throw new Error(e);
        }
    }

    static async findUserByEmail(email){
        try {
            const user = await db('users').where('email', email)
            return user;
        }
        catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    static async updatePassword(email, password){
        try {
            const salt = await bcrypt.genSalt(bcryptSaltRounds);
            const hash = await bcrypt.hash(password, salt);
            const user = await db('users').where('email', email).update({
                'password': hash
            }).returning('*').then((user)=>{
                return user;
            })
            return user;
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    static async verifyAccount(email){
        try {
            const user = await db('users').where('email', email).update({
                'verified': true
            }).returning('*').then((user)=>{
                return user;
            });
            return user;
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    static async addOrder(email, product, payment, order_status){
        try {
            const order = await db('orders').insert({
                'id': unique_id(),
                'email': email,
                'product': product,
                'payment': payment,
                'order_status': order_status,
                'date_order': Date.now()
            }).returning('*');
            return order;
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    static async deleteOrder(id){
        try {
            const order = await db('orders').del().where('id', id).returning('*');
            return order;
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    static async getOrdersByEmail(email){
        try {
            const orders = await db('orders').where('email', email).select('*');
            return orders;
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    static async getAllOrders(){
        try {
            const orders = await db('orders').select('*');
            return orders;
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    static async updateStatus(id, order_status){
        try {
            const order = await db('orders').where('id', id).update({
                'order_status': order_status
            }).returning('*').then((order)=>{
                return order;
            });
            return order;
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    static async getWishlistByEmail(email){
        try {
            const wishlist = await db('wishlist').where('email', email).select('*');
            return wishlist;
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    static async addWishlist(productid, useremail){
        try {
            const wishlist = await db('wishlist').insert({
                'id': unique_id(),
                'product_id': productid,
                'email': useremail
            }).returning('*');
            return wishlist
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    static async deleteWishlist(id){
        try {
            const wishlist = await db('wishlist').del().where({
                'id': id
            }).returning('*');
            return wishlist
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }
}