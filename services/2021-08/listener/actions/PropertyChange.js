const Action = require("../Action");

class PropertyChange extends Action{
    constructor(property, action){
        super();        
        this.property=property;
        this.action=action;
    }
    async before(id,request){
        request[id]=(await this.services.get(request.path))                 
    }
    async after(id,request,response,data){
        if(request[id][this.property] != data[this.property]){
            console.log("PropertyChange",request.params.id,this.action)
            eval(this.action);
        }
    }
}
module.exports=PropertyChange