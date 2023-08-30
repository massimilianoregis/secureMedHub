
var {Service} = require("service-libs");
try{
const Listener = require("./Listener");    
var app=new Service()
    .addDefaultConfig((config,gateway)=>{
		gateway.use(Listener.new(config,app.services))
    })
    .app

    
module.exports=app;
}catch(e){
    console.log(e)
}