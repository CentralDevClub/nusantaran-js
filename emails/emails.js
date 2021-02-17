const fs = require('fs');


module.exports = class Email {
    static replaceAll(str, emailInfo){
        let html = str;
        html = html.replace('<%= emailTitle %>', emailInfo.emailTitle);
        html = html.replace('<%= emailText %>', emailInfo.emailText);
        html = html.replace('<%= buttonLink %>', emailInfo.buttonLink);
        html = html.replace('<%= buttonText %>', emailInfo.buttonText);
        return html;
    }

    static getTemplate(){
        try {
            const email = fs.readFileSync(__dirname + '/email.html').toString();
            return email;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static getEmail (emailInfo){
        const html = this.getTemplate();
        return this.replaceAll(html, emailInfo);
    }
}