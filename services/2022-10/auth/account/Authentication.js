const crypt = require("./crypt");
const TemporaryCode = require("./TemporaryCode");

function isPasswordOk(password){
    return (
        password.length>=6 && 
        password.match(/[A-Z]/g) &&		   
        password.match(/[0-9]/g));			
}

const emailCheck = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/



class Authentication{
	
	constructor(){
	}
	
	async register(data){
		const {email,password,password_confirmation} = data;
		var errors=[]
		if(!email)									errors.push({msg:"mail is required"});
		if(password!=password_confirmation)			errors.push({msg:"password no match"});
		if(!emailCheck.test(email))					errors.push({msg:"mail invalid"});
		if(await this.find(email))			        errors.push({msg:"mail taken"});
		if(!isPasswordOk(password))			        errors.push({msg:"password invalid"})

		if(errors.length>0) 						throw errors;		
		return await this.user.new(data)
	}

	async login(email,password){  
		const user = await this.user.getByMail(email);
        if(!user) return null;		
        if(!crypt.compare(user.password,password)) return null;
        
		return user;
	}

    async addLogin(email,method){
        try{
            this.user.addLogin(email,method)
        } catch(e){
            console.log(e)
        }
    }

	async confirm(id,email){				
		if(!id) throw "no right code";
		var user = await this.find(email)	
		if(user.confirmed==true) 	return user;
		if(!this.user.confirmMail(id,email))	throw "no right code";						
		
		return user;
	}	
    async find(email,personificate=null){
        return await this.user.getByMail(email,personificate);
    }
    

    async resetPassword(email){        
        return await TemporaryCode.new(email);		                    
    }

    async changePassword(codeOrMail, password){
        if(codeOrMail.includes("@")) return await this.changePasswordWithMail(codeOrMail,password);
        else return await this.changePasswordWithCode(codeOrMail,password);
    }
    async changePasswordWithCode(code, password){
        var {user} = await TemporaryCode.find(code)                                
        return this.changePassword(user,password);
    }

    async changePasswordWithMail(email,password){        
        var user = await this.user.changePassword(email,password);
        
        return this.user;
    }

    async personificate(email,user){
        return await this.user.getByMail(email,user);
    }


}

module.exports=Authentication