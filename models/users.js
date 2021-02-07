const knex = require('knex');
const db_config = require('./db-config').config;
const db = knex(db_config);
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

    static async addUser(name, address, email, password){             
        try {
            const salt = await bcrypt.genSalt(bcryptSaltRounds);
            const hash = await bcrypt.hash(password, salt);
            await db('users').returning('*').insert({
                name: name,
                address: address,
                email: email,
                password: hash
            });
            console.log(chalk.green('User successfully registered'));
            return 'success';
        }
        catch (e) {
            console.log(chalk.red('Email already used'));
            throw new Error('Email already used');
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
}