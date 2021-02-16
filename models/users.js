const knex = require('knex');
const db_config = require('./db-config').config;
const db = knex(db_config);
const fs = require('fs')
const chalk = require('chalk');
const bcrypt = require('bcrypt');
const bcryptSaltRounds = parseInt(process.env.SALT_ROUNDS);


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
}