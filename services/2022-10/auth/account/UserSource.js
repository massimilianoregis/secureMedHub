var jwt = require('jsonwebtoken');
class User{

    
    constructor(secret,expirationTime,services){
        this.secret=secret;
        this.jwtExpirationTime= expirationTime
        this.services=services;
    }

    addJwt(user,personificate){
        var data = user
        delete data.jwt;
        if(personificate)
            data.personificationBy=personificate;
        user.jwt = jwt.sign(data,this.secret,{ expiresIn: this.jwtExpirationTime, notBefore:0 });
        return user;
    }


    async getByMail(email,personificate){
        var user = await this.services.getUserByMail({email:email});
        if(!user) return;
        return this.addJwt(user,personificate)
    }
    async new(data){
        return this.addJwt(await this.services.createUser(data))
    }
    async addLogin(email,method){
        var user = await this.getByMail(email);
        if(user.social_login == undefined){
            user.social_login = {
                facebook:false,
                google:false
            }
        }
        if(method == 'facebook'){
            user.social_login.facebook = true
        }
        if(method == 'google'){
            user.social_login.google = true
        }
        await this.services.updateUser({email:email,social_login:user.social_login})
    }
    async confirmMail(id,email) {        
        var user = await this.getByMail(email);
        if(id!=user.id.toUpperCase()) 	return false;

		await this.services.updateUser({email:email,confirmed:true})
		return true;
    }
    async changePassword(email,password){        
        var user = await this.services.updateUser({email:email,password:password,passwordChange:false})        
        return this.addJwt(user)
    }
}

module.exports=User;