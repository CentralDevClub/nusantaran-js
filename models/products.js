const fs = require('fs');
const path = require('path');

const p = path.join(path.dirname(process.mainModule.filename),'data','products.json');
const getProductsFromFile = (cb)=>{
    fs.readFile(p,(err,fileContent)=>{
        if(err){
            cb([])
        } else {
            cb(JSON.parse(fileContent));
        }
    });
};

module.exports = class Products {
    constructor(name,description,price){
        this.name = name;
        this.description = description;
        this.price = price;
    };
    
    save(){
        this.id = Math.random().toString();
        fs.readFile(p, (err,fileContent) => {
            // Inisalisasi array kosong jika tidak ada products.json
            let products = [];
            if (!err){
                // Replace products dengan file json yang berisi
                products = JSON.parse(fileContent)
            };
            // Tambahkan class / object product ke dalam products.json
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), (err) => {
                console.log(err);
            });
        });
    };

    static fetchAll(callBack){
        fs.readFile(p, (err,fileContent) => {
            if (!err){
                callBack(JSON.parse(fileContent));
            } else {
                callBack([]);
            }
        });
    };

    static findById(id,callBack){
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id);
            callBack(product);
        });
    };
};