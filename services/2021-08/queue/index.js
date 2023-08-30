const {Service} =require("service-libs");
const bodyParser = require("body-parser")
const Queue = require("./queue");
const moment = require("moment-timezone")
/*
    name: event
    priority:   realtime
                high
                medium
                low                
    creation_time:
    unique: keep_the_last
            keep_the_first
    scheduled:  time
                asap
                * * *                
    destroy:    auto
                wait
    call:       url
 */
var queue=new Queue();

var app = require("express")();
    app.get("/info",(req,res)=>{
        console.log("info")
        res.json({})
    })
    
   app.use(bodyParser.json())
    app.use("/example",require("./example")(queue))
    app.get("/:id/execute",async (req,res,next)=>{
        await queue.execute(req.params.id)
        next();
    })
    app.get("/:id/delete",async (req,res,next)=>{
        await queue.delete(req.params.id)        
        next();
    })
    app.get("/schedule",async (req,res,next)=>{
        await queue.loadSchedule();
        next();
    })
    app.get("/start",(req,res,next)=>{
        queue.start();
        next();
    })
    app.get("/clean",async (req,res,next)=>{
        await queue.clean();
        next();
    })
    app.get("/resume",async (req,res,next)=>{
        await queue.resume();
        next();
    })
    app.get("/clear",async (req,res,next)=>{
        await queue.clear();
        next();
    })
    app.get("/next",async (req,res,next)=>{
        await queue.execute();
        next();
    })
    app.get("/add",async (req,res,next)=>{       
        const {name,call}   = req.query;      
        var event={
            name:name,
            call:call
        }
        console.log(event)
        await queue.add(event);
        next();
    })
    app.post("/add",async (req,res,next)=>{        
        await queue.add(req.body);
        next();
    })
    app.get("/summary",async (req,res,next)=>{        
        res.json({
            size:await queue.size(),
            list:(await queue.list()).map(item=>`${item.name} ${item.execution?" (execution)":""} ${item.error?" (error)":""}`)
        })
    })
    app.use(async (req,res,next)=>{
        var call=`${req.protocol}://${req.get("host")}/2021-08/queue`
        res.json({
            size:await queue.size(),
            list:(await queue.list()).map(item=>
                Object.assign(item.toJSON(),{
                    old:moment(item.creation_time).fromNow(),
                    execute:`${call}/${item.id}/execute`,
                    delete:`${call}/${item.id}/delete`
                })
                ),
            onExecute:await queue.isInExecution(),
            start:`${call}/start`,
            info:`${call}`
        })
    })

    const QueueEvent = require("./event");
    var event = new Service().addRest(QueueEvent).app
    app.use("/event",
        event.app||event
        );

    const {WebHook} = require("./listener");

    var listener=new Service().addRest(WebHook).app
    app.use("/listener",
        listener.app||listener
        );

    app = new Service(app)
        .addDefaultConfig((config)=>{            
            queue.timing=config.callPerMinute||120    
            queue.jwt=config.call.jwt
            queue.gateway=config.call.gateway;        
            app.services.scheduled();
       })
       .setAsSingleton(3901)
       .app

module.exports=app;