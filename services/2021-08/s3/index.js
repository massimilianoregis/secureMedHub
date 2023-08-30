try{
var {S3,Dir} = require("./service");
var s3 = new S3();
var dir = new Dir(s3)

const {Service}= require("service-libs")
var express = require("express")
var app = express();
app.use(express.json({limit: '50mb'}));
new Service(app)
    .addDefaultConfig()
    .addInfo()
    .app

app.get("/",async (req,res)=>{    
    const {path} = req.query;
    console.log("s3",path)
    
    res.json(await s3.list(path))
})
app.post("/write",async (req,res)=>{
    var {path,data} = Object.assign(req.query,req.body);

    var result =await s3.write(path,data)
    res.json(result)    
})
app.post("/delete",async (req,res)=>{
    var {path,data} = Object.assign(req.query,req.body);

    var result =await s3.delete(path)
    res.json(result)    
})
app.post("/save",async (req,res)=>{
    var {path} = req.query;
    console.log(req.body.toString())

    var result =await s3.save(path,req.body)
    res.json(result)    
})
app.all("/read",async (req,res)=>{
    var {path} = Object.assign(req.query,req.body);

    s3.readStream(path,res)      
})

app.get("/mostRecent",async (req,res)=>{
    var {path} = req.query;

    res.json(await s3.mostRecent(path))
})
app.get("/load/mostRecent",async (req,res)=>{
    var {path} = req.query;

    var file = await s3.mostRecent(path);
    console.log(file);
    s3.readStream(file.path,res)  
})


module.exports=app;
}catch(e){console.log(e)}