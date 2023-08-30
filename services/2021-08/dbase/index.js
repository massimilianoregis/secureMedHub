const  Dump  = require("./dump");
const {Service,Services} = require("service-libs");

const app = new Service()
    .addInfo()    
    .addDefaultConfig(config=>{
    
    })
    .addJsDoc(__dirname)
    .setAsSingleton(3900)
    .app;

const DB = require("./nedb");

/**
 * GET /2021-08/dbase/
 * @summary list of dbase
 * @return {array<object>} 200 - success response
 * @tags Dbase
 */
app.get("/",async (req,res,next)=>{    
    var result=[];
    for(var i in DB.instances)
        result.push(DB.instances[i].name)
    res.json(result)
})
var caches={};
app.get("/turbo/clean",async(req,res,next)=>{
    caches={};
})
app.get("/turbo",async(req,res,next)=>{
    
    var keys = Object.keys(caches);
    
    res.json(keys.map(key=>{
        return ({
            key:key,
            size:Object.keys(caches[key]).length
        })
    }))
})
var queries={};
app.get("/queries",async(req,res,next)=>{
    res.json(queries)
})

app.use("/:name/find",async (req,res,next)=>{ 
    const {name} = req.params;
    var key = name+":"+Object.keys(req.body.q).join("&");
    queries[key]=queries[key]||0;
    queries[key]++;
    console.log("\t",name,req.body.q)
    next();
})
app.use("/:name",async (req,res,next)=>{    
    try{    
        const {name} = req.params;                         
            req.db= DB.instance(name);        
        next();
    }catch(e){
        next(e)
    }
});

var getTurbo=(table,q,skip,limit,sort)=>{
    var key = Object.keys(q).join(",");
    
    if(!caches[table+":"+key]) throw "no cache";
    console.log("\t","cache")
    return caches[key][q[key]].splice(skip,skip+limit);
}

app.get("/:name/turbo/:query(*)",async(req,res,next)=>{
    var query= req.params.query;
    var name= req.params.name;

    caches[name+":"+query]={};
    var cache = caches[name+":"+query];
    var obj = "item."+query;    
    var list = await req.db.find({},0,1000000);
    list.forEach(item=>{
        try{
        var value = eval(obj);

        cache[value]=cache[value]||[];
        cache[value].push(item)
        }catch(e){}
    });    
    res.json({size:list.length})		
})


app.use(require("express").raw({type:"text/plain"}))
/**
 * POST /2021-08/dbase/{name}/parse
 * @summary parse code
 * @param {name} name.path.required - dbase instance
 * @param {code} request.body.required - code to parse
 * @return {object} 200 - success response
 * @tags Dbase
 * @security AdminAuth
 */
app.post("/:name/parse",async (req,res,next)=>{        
    var custom={}    
    try{
    var code = eval(req.body.toString())
    var db = req.db;

    var list = await req.db.find({})
    for(var i in list){
        await code(list[i])
    }
    res.json({
        parsed:list.length,
        custom:custom        
    })
    }catch(e){console.log(e)}
})
/**
 * POST /2021-08/dbase/{name}/index
 * @summary add an index
 * @param {name} name.path.required - dbase instance
 * @param {Index} request.body.required - code to parse
 * @return {object} 200 - success response
 * @tags Dbase
 *    
 */
app.all("/:name/index",async (req,res,next)=>{
    try{ 
        console.log("*Dbase","index",req.params.name)    
        /**
        * @typedef {object} Index
        * @property {string} index.required - uuid
        */
        const {index} = req.body;    
        await req.db.ensureIndex(index)
        res.json({})
    }catch(e){
        next(e)
    }
})
/**
 * POST /2021-08/dbase/{name}/count
 * @summary parse code
 * @param {name} name.path.required - dbase instance
 * @param {Query} request.body.required - code to parse
 * @return {object} 200 - success response
 * @tags Dbase
 */
app.all("/:name/count",async (req,res,next)=>{
    try{ 
        console.log("*Dbase","count",req.params.name)  
        /**
        * @typedef {object} Query
        * @property {string} q - query
        */  
        const {q} = req.body;    
        
        res.json({count:await req.db.count(q||{})})
    }catch(e){
        next(e)
    }
})
/**
 * POST /2021-08/dbase/{name}/findOne
 * @summary parse code
 * @param {name} name.path.required - dbase instance
 * @param {Query} request.body.required - code to parse
 * @return {object} 200 - success response
 * @tags Dbase
 */
app.all("/:name/findOne",async (req,res,next)=>{
    try{ 
        console.log("*Dbase","findOne",req.params.name,req.body)
        const {q} = req.body;    
        if(Object.keys(q).length==0) return res.json(null)
        res.json( await req.db.findOne(q))
    }catch(e){
        next(e)
    }
})
/**
 * POST /2021-08/dbase/{name}/find
 * @summary parse code
 * @param {name} name.path.required - dbase instance
 * @param {FullQuery} request.body.required - code to parse
 * @return {object} 200 - success response
 * @tags Dbase
 */
app.all("/:name/find",async (req,res,next)=>{
    try{ 
        console.log("*Dbase","find",req.params.name,req.body)
         /**
        * @typedef {object} FullQuery
        * @property {string} q - query
        * @property {integer} skip 
        * @property {integer} limit
        * @property {string} sort
        */  
        const {q,skip,limit,sort} = req.body;
        try{return res.json(getTurbo(q,skip||0,limit,sort))}catch(e){};
        res.json(await req.db.find(q,skip||0,limit,sort))
    }catch(e){
        next(e)
    }
})
/**
 * POST /2021-08/dbase/{name}
 * @summary save an object
 * @param {name} name.path.required - dbase instance
 * @param {object} request.body.required - code to parse
 * @return {object} 200 - success response
 * @tags Dbase
 */
app.post("/:name",async (req,res,next)=>{
    try{ 
        console.log("*-->Dbase","insert",req.params.name,req.body)
        const data = req.body
        console.log(req.db)
        res.json(await req.db.insert(data))       
    }catch(e){        
        next(e)
    }
})
/**
 * PUT /2021-08/dbase/{name}
 * @summary update an object
 * @param {name} name.path.required - dbase instance
 * @param {UpdateQuery} request.body.required - code to parse
 * @return {object} 200 - success response
 * @tags Dbase
 */
app.put("/:name",async (req,res,next)=>{
    try{ 
        console.log("*Dbase","update",req.params.name)
        /**
        * @typedef {object} UpdateQuery
        * @property {string} q - query
        * @property {object} update
        * @property {object} opt        
        */  
        const {q,update,opt} = req.body

        res.json(await req.db.update(q,update,opt))
    }catch(e){
        next(e)
    }
})
/**
 * POST /2021-08/dbase/{name}/delete
 * @summary delete an object
 * @param {name} name.path.required - dbase instance
 * @param {DeleteQuery} request.body.required - code to parse
 * @return {object} 200 - success response
 * @tags Dbase
 */
app.post("/:name/delete",async (req,res,next)=>{
    try{ 
        console.log("*Dbase","delete",req.params.name,req.body)
        /**
        * @typedef {object} DeleteQuery
        * @property {string} q - query
        * @property {object} opt        
        */
        const {q,opt} = req.body

        res.json(await req.db.delete(q,opt))
    }catch(e){
        next(e)
    }
})
/**
 * POST /2021-08/dbase/{name}/dump
 * @summary save a huge amount of data
 * @param {name} name.path.required - dbase instance
 * @param {array<object>} request.body.required - code to parse
 * @return {object} 200 - success response
 * @tags Dbase
 */
app.post("/:name/dump",async (req,res,next)=>{
    console.log("--------")
    const data = req.body;   
    const dump = new Dump(req.db.db.filename)
        dump.add(data)
        dump.end();
    res.json(data.length);
})
app.use((err,req,res,next)=>{    
    res.status(500).send(err)
})
app._listen= app.listen;

module.exports=app;


var Server = require("./util/udpserver");
const { keyDefinitions } = require("puppeteer");
var udp = new Server()
    .action("index",async msg=>{
        var db =DB.instance(msg.db); 
        const {index} = msg;
                
        return await db.ensureIndex(index);
    })
    .action("find",async msg=>{
        try{        
        var db =DB.instance(msg.db); 
        const {q,skip,limit,sort} = msg;
        return await db.find(q,skip,limit,sort);
        }catch(e){console.log(e)}
    })
    .action("findOne",async msg=>{
        var db =DB.instance(msg.db); 
        const {q} = msg;
        return await db.findOne(q);
    })
    .action("count",async msg=>{
        var db =DB.instance(msg.db); 
        const {q} = msg;
        return await db.count(q);
    })
    .action("update",async msg=>{
        var db =DB.instance(msg.db); 
        const {q,update,opt} = msg;
        return await db.update(q,update,opt);
    })
    .action("insert",async msg=>{
        var db =DB.instance(msg.db); 
        const {data} = msg;
        return await db.insert(data);
    })
    .action("delete",async msg=>{
        var db =DB.instance(msg.db); 
        const {q,opt} = msg;
        return await db.delete(q,opt);
    })
    .enableReceiving()

