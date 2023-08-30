const {Service} = require("service-libs");

const status = new (require("./service"))();
const app = new Service()    
    .setAsSingleton(3902)
    .addInfo()
    .app

app.get("/reset",(req,res,next)=>{    
    status.reset();
    res.end();
})
app.post("/",(req,res,next)=>{    
    status.push(req.body)
    
    res.json({})
})
app.get("/",(req,res,next)=>{
    res.json(status)
})

module.exports = app;