const {Service} = require("service-libs");
const Gateway=require("./gateway")
const Discover=require("./discover")
const app = new Service()
        .addDefaultConfig(config=>{
                app.info={
                        environment:config.environment,
                        endpoint:"/2021-08/gateway"
                }                
                                
                Discover.services= app.call;
                app.startup=()=>{Gateway.instance().startup()}
        })
        .addHateoas()
        .addInfo()
        .addJsDoc(__dirname)
        .app;

        app.get("/config/all",(req,res,next)=>{
                res.json(Gateway.instance().discover.config.services)
        });
        /**
         * GET /2021-08/gateway
         * @summary This is the summary of the endpoint
         * @return {object} 200 - success response
         * @tags Gateway
         */
        app.get("/",(req,res,next)=>{
                var services = Gateway.instance().discover.services;
                //var result={}
                //services.forEach(service=>result[service.endpoint]=service)

                var result=services.map(service=>({
                        endpoint:service.endpoint,
                        online:service.online,
                        layer:service.layer,
                        details:req.hateoas(`/${service.endpoint}`),
                        error:service.error
                }))

                var layers = [];
                result.forEach(item=>{
                        if(!item.layer) return;
                        item.layer.forEach(itm=>{                                
                                layers.push({...item,layer:itm.index})
                        });
                })
                layers=layers.sort((a,b)=>a.layer-b.layer);


                res.json({
                        addServiceUrl:req.hateoas(`addService?url=`),
                        addServiceGit:req.hateoas(`addService?git=`),
                        layers:layers,
                        services:result,
                        errors:result.filter(item=>item.error)
                })
        })
        /**
         * GET /2021-08/install/ionic
         * @summary This is the summary of the endpoint
         * @return {object} 200 - success response
         * @tags Gateway
         */
        app.get("/install/ionic",(req,res,next)=>{
                const {git,branch,save} = req.query;
                var {name} = req.query;
                name=name||git;

                const config = {
                        install:{
                                git:`/${git}`,          
                                branch: branch||"develop",
                                location:`root://${name}`,                  
                                after:` npm i;
                                        ionic build --prod;`
                        }
                }
                Gateway.instance().discover.getService(name,app,config)                
        })
        app.post("/install",(req,res,next)=>{

        })
module.exports=app;