var fs = require("fs");
var path = require("path");
const serveStatic = require('serve-static')
const vhost = require('vhost')
const { exec } = require("child_process");
const {Services} = require("service-libs")
const axios = require("axios").create()

class Discover {
    constructor(config,app){
        this.group={};        
        this.config=config;
        this.root= process.cwd();
        this.app=app;
        this.servicesRoot= path.resolve(process.cwd(),"services");
        //this.call=new Services(this.config.servicesCall);
        Discover._instance=this;
    }

    getDir(dir){
		if(dir.startsWith("root://"))		return path.resolve(this.root,"..",dir.substring("root://".length));
		if(dir.startsWith("services://"))	return path.resolve(this.rootServices,dir.substring("services://".length));
		return dir;
	}

    
    getConfigurated(){
        var result = [];                
        for(var i in this.config.services){ 
            const config = this.config.services[i];
            result.push(Object.assign(config,{endpoint:i}))            
        }        
        return result;
    }
   
    async command(cmd,dir){
        return new Promise((ok,ko)=>{
            exec(cmd,{
                cwd: dir||this.dir
            }, (error, stdout, stderr) => {
                console.log("\tcommand:",cmd,stdout, stderr)
                if(error) ko(stderr);
                else ok(stdout);
            })
        })
    }
    async createFile(endpoint,fileName,text,servicesRoot){   
        servicesRoot=servicesRoot||this.servicesRoot;     
        if(endpoint.startsWith("/")) endpoint=endpoint.substring(1)
        var dir =path.resolve(servicesRoot,endpoint)
        var file=path.resolve(dir,fileName)    
        
        //if file exists exit
        if(fs.existsSync(file)) return;
        //create dirs
        fs.mkdirSync(dir,{recursive:true});

        //write file
        fs.writeFileSync(file,text)
        return fileName;
    }
    async createServer(endpoint,port){
        await this.createFile(endpoint,"server.js",`        
        const app = require("./index.js");            
        app.listen(${port});
        `);
    }
    async createProxy(endpoint,url){
        await this.createFile(endpoint,"proxy.js",`
        const proxy = require("../../../util/proxy");
        const app = require("express")();
            app.use(proxy("${url}"));
        module.exports=app;
        `);
    }
    async install(repository,dir,branch,index,after){
        console.log("\t",dir,"install".yellow)
        
        await Discover.services.install({
            git:repository,
            dir:dir,
            branch:branch,
            after:after
            });
        //fs.writeFileSync(path.resolve(__dirname,dir,"index.js"),`module.exports=require('./repository/${index}')`)
    }
    getProxy(endpoint,serviceRoot=this.servicesRoot){        
        return require(`${serviceRoot}${endpoint}/proxy`);
    }
    getIndex(endpoint,serviceRoot=this.servicesRoot){        
        return require(`${serviceRoot}${endpoint}`);
    }
    async startServer(endpoint,port){
        try{
            await this.command(`pm2 start index.js --name ${endpoint}:${port} -- ${endpoint} ${port} `)
        }catch(e){}
    }
    async initService(endpoint,app){return await this.getService(endpoint,app);}
    async getIndexService(endpoint)        {return await this.getService(endpoint,null,{singleton:false,proxy:false})}
    async getService(endpoint,app,config){
        /* create configuration with config and code config */
        var conf = this.config.services[endpoint];     
        conf.call={
            heartbeat:this.config.heartbeat,
            gateway:this.config.gateway,
            jwt:this.config.jwt
        }   
        conf.endpoint=endpoint
        var serviceApp= {}
        try{serviceApp=this.getIndex(endpoint);   }catch(e){}
        conf = Object.assign(conf,serviceApp.config,config);  

        if(!endpoint.startsWith("/")) app=null;
        /* /config */

        /* install */
        if(conf.install)try{                    
            await this.install(
                conf.install.git,
                conf.install.location||`services:/${endpoint}`,
                conf.install.branch,
                conf.install.index,
                conf.install.after);                    
        } catch(e){console.error("installation error ".red,conf.install.git)}

        /* if singleton I need start a proxy */
        if(conf.singleton){                                    
            await this.startServer(endpoint,conf.singleton);            
            conf.proxy=`http://localhost:${conf.singleton}`;
        }

        /* proxy */
        if(conf.proxy){
            await this.createProxy(endpoint,conf.proxy)
            var proxy = this.getProxy(endpoint);
            if(app) app.use(endpoint,proxy); 
            console.log("\t",endpoint,"proxy".green)
            
            try{await axios.post(`${conf.proxy}/config`,conf);}catch(e){    
                console.log("\t\tsend config error".red,`${conf.proxy}/config`.red)
            }

            return proxy
        }
          
        //set configuration on index
        try{                            
            if(serviceApp.setConfig){
                var gateway= {
                    addLayer:function(type){
                        serviceApp.layer=serviceApp.layer||[]; 
                        app.layer=app.layer||0; 
                        serviceApp.layer.push({index:app.layer++,method:type});
                    },
                    use:function(){this.addLayer("use"); app.use(...arguments)},
                    get:function(){this.addLayer("get"); app.get(...arguments)},
                    app:app
                }
                serviceApp.setConfig(conf,gateway);            
                }
        }catch(e){
            console.log(`${endpoint} config error:`.red,e)
        }                                    
        serviceApp.endpoint=endpoint;

        //add the app to gateway
        if(app)     console.log("\t",endpoint,"linked".green)         
        if(app)     app.use(endpoint,serviceApp.app||serviceApp);
        

        return serviceApp;
    }
   
    async initServices(app,serviceRoot){
        console.log("---init services---".yellow.bold)
        app=app||this.app||require("express")();
        serviceRoot=serviceRoot||this.servicesRoot;
        var list = this.getConfigurated();                
        var config = this.config;
        Services.defaultConfig({
            gateway:config.gateway,
            jwt:config.jwt,
        })
        list = list.filter(item=>!item.disabled)
        this.services=list;
        for(var i in list)
            try{
                var service=list[i];
                var {endpoint,access} = service;
                var {layer}= await this.initService(endpoint,app,config,serviceRoot)                
                service.layer=layer;
                service.online=true;
            }catch(e){
                list[i].error=e;
                console.error("error",e)
            }
        /*
        app.use((err,req,res,next)=>{	
            console.log(err)
            res.status(500).send({error:err})
            })*/
        console.log("---/init services---".yellow.bold)
        return app;
    }    
    
    static instance(){
        return this._instance;
    }

}
module.exports=Discover;