const { start } = require("./default");
var config = require("../../../util/config");
const path  = require("path");




class Startup{
    static async init(){           
        var startup = new Startup();        
        config.load(async ()=>{     
            startup.config=config       
            await startup.startup()
        });
        return startup;    
    }

    get config(){return this._config;}
    set config(config){
        config= config.newconfig;
        this._config=config;

        var result = [];                
        console.log("config:".green,"-----------------------".green.bold)
        for(var i in config.services){ 
            if(config.services[i].disabled) continue;
            const cfg = Object.assign(config.services[i],{endpoint:i});
            
            console.log("\t","config:".green,"read-hardcoded-config".yellow,i)
            var service;        
            try     {service = require("../.."+i);}catch(e){console.log("\t\t","config:".green,"no service readable")}
            try     {service.setConfig(cfg);}
            catch(e){console.log("\t\t","config:".red,cfg.endpoint+"".red,"no configuration hook".red)}

            result.push(cfg)            
        }        
        
        console.log("config:".green,"/-----------------------".green.bold)
        this.services=result;
    }
   
    async startup(config){
        this.startGitService();

        console.log("---install services---".yellow.bold)                
        var services = this.services;                
        
        for(var i in services)
            try{
                var service=services[i];                
                await this.startupService(service)                                
            }catch(e){
                console.error("error",e)
            }
        
        console.log("---/install services---".yellow.bold)
    }   

   
    async startGitService(){
        
    }    

    async createProxy(endpoint, config){
        console.log("\t\t","createProxy".yellow,config)
    }
    async startSingleton(endpoint, config){
        console.log("\t\t","startSingleton".yellow,config)
    }
    
    async installService(config){
        console.log("\t\t","install".yellow,config.endpoint)
        //await this.command(`pm2 start index.js --name ${endpoint}:${port} -- ${endpoint} ${port} `)
    }
    async installOnAWS(endpoint,config){
        console.log("\t\t","install on aws".yellow,endpoint)
        
    }
    async startupService(config){        

        console.log("\t","init",config.endpoint.green)
        /* install */
        if(config.install)try{                    
            this.installService(config);
        } catch(e){console.error("installation error ".red,config.install.git)}

        /* if singleton I need start a proxy */
        if(config.singleton){                                    
            await this.startSingleton(config.endpoint,config.singleton);            
            config.proxy=`http://localhost:${config.singleton}`;
        }        
        /* proxy */
        if(config.proxy){
            await this.createProxy(config.endpoint,config.proxy)     
        }     
        /* AWS */
        if(config.aws){
            await this.installOnAWS(config.endpoint,config.aws)     
        }     
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
}

(async()=>{
    await Startup.init()
})()