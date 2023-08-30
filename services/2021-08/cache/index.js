const {Service} = require("service-libs");
const fs =require("fs")
const path =require("path")
const moment = require("moment")

var app = new Service()
    .addDefaultConfig((config,app)=>{
        if(config.data?.startsWith("file:/")) 
            Cache.dir = eval(config.data.substring(6))

        config=config.listen;
        for(var path in config){            
            var time= config[path];
            console.log(`app.use(${path},Cache.newCache(${path},${time}).app())`)
            app.use(path,Cache.newCache(path,time).app())
        }
             
    })
    .addInfo()    
    .app

module.exports=app;

class Cache{        
    static set config(config){

    }
    static newCache(name,time){
        return new Cache(name,time);        
    }
    
    
    constructor(name,time){
        this.name=name;      
        fs.mkdirSync(Cache.dir,{recursive:true});      
        this.file=path.resolve(
            Cache.dir,
            name.replaceAll("/","_")+".cache"
            )
        
    }
    set time(value){
        //extract unit mesure
        var um = value.replace(/[^a-zA-Z]+/g, '')
        if(um=="sec"||um=="secs") um="seconds";
        if(um=="min"||um=="mins") um="minutes";
        if(um=="h"||um=="hs") um="hours";

        //extract numeric value
        value = Number.parseInt(value);
        var duration = moment.duration(value,um)        
        this.duration = duration.asMilliseconds()
    }
    isOld(){
        try{
            var {mtime} = fs.statSync(this.file)        
            return moment().diff(moment(mtime))>this.duration
        }catch(e){
            return true;
        }
    }
    save(value){
        fs.writeFileSync(this.file,JSON.stringify(value))
        return value
    }
    read(){
        return JSON.parse(fs.readFileSync(this.file).toString())
    }
    //extract express app;
    app(){    
        return (req,res,next)=>{
            if(!this.isOld())
            return res.json(this.read());

            res._jsoncache= res.json;
            res.json=(data)=>{                         
                res._jsoncache(this.save(data));
            }
            next();
        }        
    }
}

Cache.dir=path.resolve(__dirname,"data")