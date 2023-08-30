const {Document} = require("service-libs");
const { uuid } = require("uuidv4");
class TemporaryCode extends Document{
    static configDB(db){
        this.expirationTime=60*60*5
        db.ensureIndex({ fieldName: 'createdAt', expireAfterSeconds: this.expirationTime });
		db.ensureIndex({ fieldName: 'user'});
		db.ensureIndex({ fieldName: 'code'});
    }
    
    static async find(code){
        return await super.get({code:code});
    }
    static async new(mail){        
        var code = uuid();
        if(this.size) code=code.substring(0,this.size);        
        
        return await super.new({
                createdAt:new Date(),
                expiration: this.expirationTime,
                code:code,
                user:mail
            })
    }

}
module.exports = TemporaryCode