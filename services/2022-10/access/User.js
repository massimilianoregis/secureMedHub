class User{
    constructor(jwtData,roles){
        User.roles=roles
        Object.assign(this,jwtData);

        if(!this.roles) this.roles=["unknown"]                
    }
    set roles(value){
        this._roles=value.map(role=>User.roles.find(item=>item.name==role.name||role))
    }
    get roles(){
        return this._roles;
    }
    
    canAccess(req){
        return this.roles.find(role=>role.canAccess(req))!=null;
    }
}
module.exports=User