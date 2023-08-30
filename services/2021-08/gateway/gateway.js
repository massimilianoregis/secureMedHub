require("../../../util/PromiseLimit")
const serveStatic = require('serve-static')
const path = require("path");
const vhost = require('vhost')
const proxy = require("../../../util/proxy");
const referer = require("../../../util/proxy/referer");
const moment = require("moment-timezone")
	  moment.tz.setDefault("America/Los_Angeles");
const Discover = require("./discover");

class Gateway{

    
    static newInstance(app,servicesRoot){
        if(!Gateway._instance) Gateway._instance= new Gateway(app,servicesRoot)
        return Gateway._instance;
    }
    static instance(){
        if(this._instance)  return this._instance;
        return this.newInstance();
    }
    get root(){
        return process.cwd();
    }
    

    static async getInstance(endpoint){
        return await (this.instance().discover.getIndexService(endpoint));
    }
    serviceRequire(name){        
        var app = require(this.servicePath(name));
            try{app.config(this.serviceConfig(name));}
            catch(e){console.log("gateway:".red,name+"".red,"no configuration hook".red)}
        return app;
    }
    serviceConfig(name){
        return Object.assign({
            call:{
                gateway:this.config.gateway,
                jwt:this.config.jwt
            }
        },this.config.services[name])
    }
    servicePath(name){
        if(name.startsWith("/")) name=name.substring(1);
        return path.resolve(this.servicesRoot,name)
    }
    localPath(name){
        if(name.startsWith("/")) name=name.substring(1);
        return path.resolve(this.root,name);
    }
    requireLocal(name){
        if(name.startsWith("/")) name=name.substring(1);
        return require(path.resolve(this.root,name));
    }    
    vhostPath(name){
        if(name.startsWith("/")) name=name.substring(1);
        return path.resolve(this.root,"..",name);
    }
    

    constructor(app,servicesRoot){
        this.app = app||require("express")();
        this.servicesRoot=servicesRoot||path.resolve(this.root,"services");
        this.started=false;        
        this.discover = new Discover(this.config,this.app);        
        this.services=[];        
        this.status="startup";
    }
    get config(){        
        return this.requireLocal("/util/config").newconfig;
    } 
    get gatewayConfig(){
        return this.config.services["/2021-08/gateway"]
    }
    isReady(){return this.status=="ready";}
    ready(){
        this.status="ready";
    }   
    error(e){
        this.status=e;
    }
    addWelcomePage(){        
        this.app.use((req,res,next)=>{
            if(this.isReady()) return next();
            res.status(503).json({
                hi:"The server is currently unavailable....",
                status:this.status,
                pid:process.pid,
                req:req.originalUrl
            })
        })
    }
    //@deprecated
    async loadBasicServices(){
        this.services={}
        const services = this.gatewayConfig.services        
        for(var i in services){
            const serviceEndpoint = services[i];            
            console.log("gateway:".green,"loadBasicService".green,serviceEndpoint)
            this.services[i] =await this.discover.initService(serviceEndpoint)
        }
    }
    //@deprecated
    async getBasicService(name){                
        const services = this.gatewayConfig.services   
        const endpoint = services[name]
        this.services[name] = await this.discover.initService(endpoint);
        return this.services[name];
    }
    //@deprecated
    async enableSSL(port){        
        port = port||this.gatewayConfig.sslPort;
        if(!port) return this;
        try{
            return (await this.getBasicService("ssl")).SSL.enable(this.app,port);
        }catch(e){
            console.log("SSL",e)
        }
        return this;
    }
    enableCompression(){
        this.app.use(require('compression')());							
        return this;
    }    
    accessControl(){
        this.app.use(this.requireLocal("/util/accessControl"))        
        return this;
    }
    async addListener(){
        this.app.use((await this.getBasicService("listener")).layer)
    }
    async auth(service){
        this.app.use(
            service?require(service):(await this.getBasicService("auth")).layer
            );
        return this;
    }
    async accessAuthorization(service){
        this.app.use(
            service?require(service):(await this.getBasicService("access")).layer
            );
        return this;
    }
    proxy(endpoint,url){
        this.app.use(endpoint,proxy(url))
        return this;
    }
    addService(endpoint,file){
        this.app.use(endpoint,require(file))
        return this;
    }
    async discoverServices(root,config){
        root = root||this.servicesRoot
        config = config||this.config;
        //init git because is needed from Discover        
                        
        await this.discover.initServices(this.app)
        return this;
    }
    async virtualHostIonic(host,dir,prefix){
        var app = require("express")();
            if(prefix){
                app.use((req,res,next)=>{console.log(req.originalUrl); next();})
                
                app.use(prefix,serveStatic(this.vhostPath(dir)))
                app.use(prefix,(req,res)=>res.sendFile(this.vhostPath(`${dir}/index.html`)))
            }else{
                app.use(serveStatic(this.vhostPath(dir)))
                app.use((req,res)=>res.sendFile(this.vhostPath(`${dir}/index.html`)))
            }

        this.app.use(vhost(`*.${host}`,app));
        this.app.use(vhost(host,app));
        return this;
    }
    localUI(){
        if(!this.gatewayConfig.localUI) return;
        
        this.app.use("/admin",proxy("http://localhost:8001"));
        this.app.use(referer("admin",proxy("http://localhost:8001"))); //account   
        this.app.use(proxy("http://localhost:8000")); //account   
        //this.app.use(referer("admin",proxy("http://localhost:8001")));
        
    }
    async virtualHost(host,dir,prefix){
        var app = require("express")();
            if(prefix){                
                app.use(prefix,serveStatic(this.vhostPath(dir)))                
            }else{
                app.use(serveStatic(this.vhostPath(dir)))                
            }

        this.app.use(vhost(`*.${host}`,app));
        this.app.use(vhost(host,app));
        return this;
    }
    redirectWhenError(){
        this.app.use((err,req,res,next)=>{	
            console.log(err);
            res.redirect("/error")
        })
    }
    listen(port){        
        port = port||this.gatewayConfig.port;
        console.log("gateway".green,"listen".green,port)
        this.app.listen(port);
        this.started=true
        return this;
    }

    startup(){
        require("./default").start()
    }
}
module.exports=Gateway;