const products = [];

module.exports = class Products {
    constructor(name){
        this.name = name;
    };

    save(){
        products.push(this);
    };

    static fetchAll(){
        return products;
    };
};