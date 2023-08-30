var {Datastore} = require('service-libs');
var path = require("path");

class DB{
    static instances=[]
    static instance(name){
        if(this.instances[name]) return this.instances[name];
        console.log("load DB",name)
        var filename = path.resolve(process.cwd(),"db",name+".nedb")                
        var db=new Datastore({ filename: filename,autoload: true})        
        this.instances[name]=new DB(db,name)
        return this.instances[name];
    }
    constructor(db,name){
        this.db=db;
        this.name=name;
    }
    async ensureIndex(config){
        return new Promise((ok,ko)=>{            
            this.db.ensureIndex(config,(err)=>{             
                if(err) return ko(err)
                ok({})
            })
        })  
    }
    async insert(data){
        return new Promise((ok,ko)=>{            
            this.db.insert(data,(err,doc)=>{             
                if(err) return ko(err)
                ok(doc)
            })
        })  
    }
    async update(query,update,option={}){        
        return new Promise((ok,ko)=>{
            console.log("update",query,update,option)
            this.db.update(query,update,option,(err,doc)=>{
                console.log("update",err)
                if(err) return ko(err)
                ok(doc)
            })
        })  
    }
    async count(query){        
        return new Promise((ok,ko)=>{
            this.db.count(query,(err,doc)=>{
                if(err) return ko(err)
                ok(doc)
            })
        })  
    }
    async findOne(query){
        if(Object.keys(query||{}).length==0) return;
        return new Promise((ok,ko)=>{            
            this.db.findOne(query,(err,doc)=>{                
                if(err) return ko(err)
                ok(doc)
            })
        })  
    }
    async find(query,skip,limit,sort){      
        return new Promise((ok,ko)=>{            
            var cursor = this.db.find(query)            
            if(skip) cursor.skip(skip);
            if(limit) cursor.limit(limit);
            if(sort) cursor.sort(sort);
            cursor.exec((err,doc)=>{
                if(err) return ko(err)
                ok(doc)
            })
        })        
    }
    async delete(query,opt){
        return new Promise((ok,ko)=>{
            this.db.remove(query,opt,(err,doc)=>{
                if(err) return ko(err)
                ok(doc)
            })
        })  
    }
}

module.exports=DB