
try{
const Project = require("./Project");
var project;
var {Service} = require("service-libs");

var app = new Service()
    .addInfo()
    .addDefaultConfig(config=>project=new Project(config))
    .addJsDoc(__dirname)    
    .app;

app.get("/",async (req,res,next)=>{        
    res.json(await project.toJSON())
})
app.all("/git/webhook",async (req,res,next)=>{        
    project.git.webhook(req.body);
    res.json({})    
})
app.all("/trello/webhook",async (req,res,next)=>{           
    console.log("/trello/webhook")
    project.trello.webhook(req.body);        
    res.json({})    
})

module.exports=app;
}catch(e){console.log(e)}

//app.listen(3000)