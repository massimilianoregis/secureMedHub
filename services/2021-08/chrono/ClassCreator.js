/**
 * create with constructor
 * {"clsName":[...]}
 * 
 * create with null constructor
 * "clsName"
 * 
 * create with configuration
 * {"clsName":{...}}
 */
class ClassCreator{
    constructor(path,defaultClass){
        this.path = path;
        this.defaultClass=defaultClass;
    }
    create(json){        
        //extract currenct class or default class
        json = json.cls||{[this.defaultClass]:json};        

        var cls;
        var params;
        if(typeof(json)=="string") cls=json;
        if(typeof(json)=="object") {
            cls=Object.keys(json)[0];
            params=json[cls];
        }

        var cls = require(`${this.path}/${cls}`)
        
        if(Array.isArray(params))
            return new cls(...params);    
        return new cls(params);
    }
}
module.exports=ClassCreator
