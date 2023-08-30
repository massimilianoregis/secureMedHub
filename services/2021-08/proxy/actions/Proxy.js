const proxy = require("../../../../util/proxy");
class Proxy{
    constructor(url){        
        this.url= url;
    }
    async call(req,res,next)   {            
        console.log("PROXY-->",this.url)
        proxy(this.url)(req,res,next)        
    }    
}
module.exports=Proxy