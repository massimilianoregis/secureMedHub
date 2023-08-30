var path = require("path");


/**
 * this is the class that is able to create the chain
 * the chain of responsability is created from config.js 
 * features:[
 *              {cls:"AnlternateMail"}
 *         ]
 * 
 * cls is the class name and the item single json is the constructor
 */

//change to ChainFactory
class ChainFactory{
    static new(config,dir,services,feature){
        var chain=[];
        config.forEach(item=>{
            var {cls} = item;
                cls = require(`${dir}/${cls}`);
                cls.services=services;
                cls.sender=feature
            var itemObject = new cls(item); //I added this (workflow) in order to pass a basic configuration in the constructor
            chain.push(itemObject);                         
        })
        return chain;
    }
}
module.exports=ChainFactory