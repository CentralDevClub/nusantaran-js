const knex = require('knex');
const db_config = require('./db-config').config;
const db = knex(db_config);
const chalk = require('chalk');


const allUser = (cb)=>{
    db('users').select('*').then(user=>{
        cb(user);
    });
};

module.exports = class Users{
    static addUser(name, address, email, password){
        db('users').returning('*').insert({
            name: name,
            address: address,
            email: email,
            password: password
        }).then(()=>{
            console.log(chalk.underline.green('User successfully registered'));
        });
    }

    static findUserByEmail(email, callBack){
        allUser(users => {
            const user = users.find(u => u.email === email);
            callBack(user);
        });
    }
}