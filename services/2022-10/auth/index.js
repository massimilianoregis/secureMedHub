try{
const {Service} = require("service-libs");
const app = new Service()
    .addInfo()
    .addJsDoc(__dirname)
    .addDefaultConfig((config)=>{                            
        app.use(require("./account").setConfig(config.account))   
        app.use("/google",require("./google").setConfig(config.google))
        app.use("/facebook",require("./facebook").setConfig(config.facebook))	                             
    })
    .app;
    
module.exports=app;
}catch(e){
    console.log("###",e);
}