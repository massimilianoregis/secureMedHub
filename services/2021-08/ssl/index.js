const ssl = new (require("./service"))()
const {Service} = require("service-libs");
const moment    = require("moment")

const app= require("express")();
app.get("/initCertificate",async (req,res,next)=>{    
    try{    
        var {domain} = Object.assign(req.body||{},req.query);
        var current = await ssl.installCertificate(domain);    
        var exp=moment(current.exp).subtract(5, 'days')
        console.log({domain:domain,day:exp.format("D"),month:exp.format("MM")})
        await app.services.renew({domain:domain,day:exp.format("D"),month:exp.format("MM")})
        res.json({})
    }catch(e){
        res.json({})
    }
})

new Service(app)
    .addInfo()
    .addDefaultConfig((config,gatewayApp)=>{                
        ssl.sslForFree=config.sslForFree;   
        if(config.port) ssl.enable(gatewayApp,config.port)  

        if(!config.initSSL)   return;         
        config.domains.forEach(domain=>{     
            ssl.addDomain(domain)
            app.services.initCertificate({domain:domain})                        
        })
    })
    .app;
    app.get("/",async (req,res,next)=>{
        
        res.json(ssl.availableCertificates())
    })
    
module.exports =app;
module.exports.SSL=ssl;