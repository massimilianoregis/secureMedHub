const JSONTranslator = require("./JSONTranslator");
const ClassCreator = require("./ClassCreator");
const UrlParser = require("./UrlParser");


class Listener {    
    
    static new(config,services){    
        var {defaultClass,listen} = config;
        //add workflows to express
        var app = require("express")();
        //classCreator
        var cls = new ClassCreator("./actions")

        //extract the listen
        for (var url in listen){
            var cfg = listen[url];
            var clsToCreate = cfg.cls;
            if(!clsToCreate) clsToCreate={[defaultClass]:cfg} 
            var action = cls.create(clsToCreate);
                action.services=services;
            new Listener(cfg).addToExpress(app,url,action)                             
        }
        return app;        
    }

    constructor(config){
        this.config = config;
        if(config.data) this.jsonTranslator=new JSONTranslator(config.data);
    }


    addToExpress(app,url,listener){
        var {verb,url} = UrlParser.parse(url);
        app[verb](url,async (req,res,next)=>{                        
            await listener.call(req,res,next);
                        
        })
    }
}


module.exports=Listener