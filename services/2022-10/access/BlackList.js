const {Document} = require("service-libs");
const ms = require("ms");
const moment = require("moment")
var jwtdecoder = require('jsonwebtoken');

class BlackList extends Document{
    
    constructor(jwt){
        super(jwt instanceof Object?jwt:{});
        
        if(typeof(jwt)=="string"){
            var jwtobj = jwtdecoder.decode(jwt)
            this.jwt=jwt;
            this.userId=jwtobj.id;
            this.email = jwtobj.email;
            this.expireAt=new Date(jwtobj.exp*1000)
        }       
        
    }
    static setExpiration(time){
        this.expireAt= ms(time)/1000;
    }    

    static configDB(db){            
        db.ensureIndex({ fieldName: 'expireAt', expireAfterSeconds: 0 });
		db.ensureIndex({ fieldName: 'jwt'});		    
    }

    //consider this jwt as not valid
    static async kickJwt(jwt){
        var {userId} = jwtdecoder.decode(jwt)
        await BlackList.db.remove({userId:userId},{multi:true});
        return await BlackList.new(jwt);         
    }

    static async banJwt(jwt){
        var {userId} = jwtdecoder.decode(jwt)
        await BlackList.db.remove({userId:userId},{multi:true});
        //jwt.expireAt= moment().add(100, 'years').toDate().getTime()/1000
        var black =  await BlackList.new(jwt);         
            black.expireAt=0;
            await black.save();
    }


    toJSONDB(){        
        return {
            jwt:this.jwt,
            userId:this.userId,
            email:this.email,
            expireAt:this.expireAt,
            createdAt:this.createAt||new Date()
        }
    }
}
module.exports=BlackList;