const knex = require('knex');
const db_config = require('./db-config').config;
const db = knex(db_config);
const chalk = require('chalk');
const bcrypt = require('bcrypt');
const bcryptSaltRounds = parseInt(process.env.SALT_ROUNDS);


const allUser = async ()=>{
    try {
        const user = await db('users').select('*');
        return user;
    }
    catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

module.exports = class Users{
    static async addUser(name, address, email, password){             
        const salt = await bcrypt.genSalt(bcryptSaltRounds);
        const hash = await bcrypt.hash(password, salt);
        try {
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
            const users = await allUser();
            const user = users.find(u => u.email === email);
            if (user){
                return user;
            } else {
                throw new Error('User not found');
            }
        }
        catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }
}