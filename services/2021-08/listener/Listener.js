const StopError = require("./StopError");
const Action = require("./Action");
const JSONTranslator = require("./JSONTranslator");
const ClassCreator = require("./ClassCreator");
const UrlParser = require("./UrlParser");
const { uuid } = require("uuidv4");


class Listener {    
    
    static new(config,services){        
        //add workflows to express
        var app = require("express")();
        //classCreator
        var cls = new ClassCreator("./actions")

        //extract the listen
        var id=1;
        for (var url in config.listen){
            var cfg = config.listen[url];
            if(!cfg.disabled){
                console.info("\tListener".yellow,"adding".yellow,url||"*")
                var action = cls.create(cfg.cls);
                    action.services=services;
                new Listener(cfg).addToExpress(app,url,action,id++)                             
            }
        }
        return app;        
    }

    constructor(config){
        this.config = config;
        this.jsonTranslator=new JSONTranslator(config.data);
    }


    addToExpress(app,url,listener,id){
        var {verb,url} = UrlParser.parse(url);

        console.info("\tListener".green,"added".green,verb,url)
        app[verb](url,async (req,res,next)=>{        
            console.info("\tListener".green,"calling".green,url,req.originalUrl)                        
            var id = Buffer.from(uuid(), 'hex').toString('base64').replaceAll("=","")
            req.shortUUID=id;
            var name = `listener_${id}`;

            try{
                req.before= await listener.before(id,req);
            }
            catch(e){
                if(e instanceof StopError)
                    return res.json(e.message);                

                console.error(e);
            }
                        
            res[`${name}_json`]=res.json;                          
            res.json=async (resp)=>{
                try{
                var response = resp.toJSON?await resp.toJSON():JSON.parse(JSON.stringify(resp))                
                req.data = await this.jsonTranslator.translate(req,response);                

                listener.after(id,req,res,resp)
                }catch(e){console.log(e)}
                res[`${name}_after`]=true;
                res[`${name}_json`](resp);
            }     
            res[`${name}_end`]=res.end;                          
            res.end=(resp)=>{              
                if(!res[[`${name}_after`]])    
                    listener.after(id,req,res,resp)
                res[`${name}_end`](resp);
            }           
            next();
        })
    }
}


module.exports=Listener