
var {Service} = require("service-libs");
try{
const Listener = require("./Listener");   
var enabled=true; 
var app=new Service()
    .addDefaultConfig((config,gateway)=>{
      enabled = config.initialStatus=="on";
      var proxy = Listener.new(config,app.services);
      gateway.use((req,res,next)=>{
          if(enabled) return proxy(req,res,next)
          next();
        })
    })
    .app

app.get("/",(req,res,next)=>{
  res.json({enabled:enabled})
})
app.get("/on",(req,res,next)=>{
  enabled=true;
  res.json({enabled:enabled})
})
app.get("/off",(req,res,next)=>{
  enabled=false;
  res.json({enabled:enabled})
})
module.exports=app;
}catch(e){
    console.log(e)
}