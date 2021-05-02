const crypto = require('crypto')

module.exports = async function generateToken(){
    const buffer = await new Promise((resolve, reject)=> {
        crypto.randomBytes(32, (err, buffer)=>{
            if (err){
                reject('Error generating token')
            }
            resolve(buffer)
        })
    })
    
    return buffer.toString('hex')
}