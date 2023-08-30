class User{
    constructor(jwtData){
        Object.assign(this,jwtData);

        if(!this.roles) this.roles=[]
        if(this.roles.find(item=>item.name=="admin")) this.role="admin";
        if(this.id) this.roles.push({name:"user"})
        if(this.id && !this.role) this.role="user"; 
        if(!this.role) this.role="unknown"
    }
    canAccess(role){
        if(this.roles.find(item=>item.name=="admin")) return true;        
        if(role==null) return true;			
		if(role.forEach && role.length==0) return true;

		if(!role.forEach)
            return this.roles.find(item=>item.name==role)

        for(var i in role)
            if(this.canAccess(role[i])) 
                return true;							

		return false;
    }
}
module.exports=User