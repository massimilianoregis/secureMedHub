const { Service } = require("service-libs");
const CloudFlare = require("./service")
var cloudflare;

var app = new Service()
    .addInfo()    
    .addJsDoc(__dirname)
    .addDefaultConfig(config=>{
        cloudflare=new CloudFlare(config.auth)
    }).app	

app.all("/dns",async(req,res,next)=>{
    const {domain,ip}=req.query;
    
    res.json(await cloudflare.dns(domain,ip))
})

module.exports=app;