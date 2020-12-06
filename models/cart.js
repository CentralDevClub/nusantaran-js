const fs = require('fs')
const path = require('path')

const p = path.join(path.dirname(process.mainModule.filename),'data','cart.json');

module.exports = class Cart {
    static addProduct(productID, productPrice){
        fs.readFile(p,(err,fileContent)=>{
            let cart;
            if (err){
                cart = {products:[],totalPrice:0};
                cart.products.push({id:productID,qty:1})
                cart.totalPrice += parseInt(productPrice)
            } else {
                cart = JSON.parse(fileContent);
                const existingProduct = cart.products.find(product => product.id === productID);
                if (existingProduct){
                    existingProduct.qty++
                    cart.totalPrice += parseInt(productPrice)
                } else {
                    cart.products.push({id:productID,qty:1})
                    cart.totalPrice += parseInt(productPrice)
                }
            };
            fs.writeFile(p,JSON.stringify(cart),err => {
                console.log(err);
            });
        });
    }

    static fetchAll(callBack){
        fs.readFile(p, (err,fileContent)=>{
            if (err){
                callBack([]);
            } else {
                callBack(JSON.parse(fileContent));
            }
        });
    }
};