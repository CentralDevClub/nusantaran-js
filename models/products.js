const fs = require('fs');
const path = require('path');

module.exports = class Products {
    constructor(name){
        this.name = name;
    };
    
    save(){
        const p = path.join(path.dirname(process.mainModule.filename),'data','products.json');
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
        const p = path.join(path.dirname(process.mainModule.filename),'data','products.json');
        fs.readFile(p, (err,fileContent) => {
            if (!err){
                callBack(JSON.parse(fileContent));
            } else {
                callBack([]);
            }
        });
    };
};