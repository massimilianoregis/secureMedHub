try {
const referer = require("../../../util/proxy/referer");
const proxy = require("../../../util/proxy");
const {Service} = require("service-libs");
const serveStatic = require('serve-static')
const vhost = require('vhost')
var path = require("path");

module.exports = new Service()
    .addDefaultConfig((config,app)=>{        
        var static =    Static.add(config.routes)        
        app.use((req,res,next)=>{
            if(req.path.match(/^\/\d{4}-\d{2}\/.*?$/)) return next();
            static(req,res,next);
        });
    })
    .addInfo()
    .app

class Static{
    static add(config,app){        
        if(!app) app = require("express")();        

        config.forEach(cfg=>{
            console.log("\t\tStatic".yellow,cfg.vhost||cfg.req)  
            
            if(!cfg.access){
                if(cfg.vhost)    app.use(vhost(cfg.vhost,this.addStatic(cfg.dest)));                
                if(cfg.req)      app.use(cfg.req,this.addStatic(cfg.dest));                                            
                if(cfg.referer)  app.use(referer(cfg.referer,this.addStatic(cfg.dest)));            
            } else {        
                if(cfg.vhost)    app.use(vhost(cfg.vhost,this.addAccess(cfg)));                
                if(cfg.req)      app.use(cfg.req,this.addAccess(cfg));                                            
                if(cfg.referer)  app.use(referer(cfg.referer,this.addAccess(cfg)));            
            }
            
        })   
        
        return app;     
    }

    static addAccess(config){
        var staticApp = this.addStatic(config.dest);
        
        return (req,res,next)=>{
            //if(req.user.canAccess(config.access))
            return staticApp(req,res,next);            
            //return res.redirect(config.redirect)
        }            
    }

    static addStatic(dest){
        if(Array.isArray(dest)) return Static.add(dest);
        if(dest.startsWith("services://"))  dest = path.resolve(process.cwd(),"services",dest.substring(11));
        if(dest.startsWith("here://"))  dest = path.resolve(__dirname,dest.substring(7));
        if(dest.startsWith("root://"))  dest = path.resolve(process.cwd(),"..",dest.substring(7));
        if(dest.startsWith("proxy://")) {
            console.log("\t\t\tStatic".green,"add proxy",dest)  
            return proxy(dest.replace("proxy://","http://"));  
        }
        
        console.log("\t\t\tStatic".green,"add static",dest) 
        var app = require("express")()
            app.use(serveStatic(dest,{ index: ['index.html','index.js']}));   
            app.use((req,res)=>res.sendFile(path.resolve(dest,"index.html")))
            app.use((req,res)=>res.sendFile(path.resolve(dest,"index.js")))
        return app;
    }

}

}catch(e){
    console.log(e)    
}