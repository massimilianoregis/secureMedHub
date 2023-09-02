
class Role{
    constructor(name,items,generalConfig){
        this.name=name;
        this.items=items.map(item=>require('./CheckFactory').create(item,generalConfig));
    }
    
    canAccess(req){        
        if(this.items.find(item=>item.canAccess(req))) return true;
        return false;
    }
}
module.exports=Role