try{
var jwtdecoder = require('jsonwebtoken');

var {Service}= require("service-libs")
var BlackList =require("./BlackList")

var services;
app = new Service()
    .addInfo()
    .addHateoas()
    .addDefaultConfig((config,gatewayApp)=>{                      
        services=app.services     

        config.roles=Object.entries(config.roles).map(([name,items])=>({name,items}))        
        
        require("./layer")(gatewayApp,config)
    }).app

  app.get("/ban/:id",async(req,res,next)=>{
    var {id}= req.params;
    var {jwt} = await app.services.jwt({user:id});      //find the jwt
    
    var kick = await BlackList.banJwt(jwt);
    res.json(kick)  
  })
  app.get("/kick/:id",async(req,res,next)=>{
    var {id}= req.params;
    console.log(app.services);
    var {jwt} = await app.services.jwt({user:id});      //find the jwt
    
    var kick = await BlackList.kickJwt(jwt);
    res.json(kick)      
  })
app.get("/blacklist/clear",async(req,res,next)=>{
  await BlackList.db.remove({},{multi:true})
  res.redirect(req.hateoas(`../`))
})
app.addRest(BlackList,"/blacklist")


module.exports=app;
}catch(e){
  console.log(e)
}