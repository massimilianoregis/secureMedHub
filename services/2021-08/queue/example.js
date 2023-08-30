var queue;
var app = require("express")();
    app.get("/call",(req,res,next)=>{
        queue.add({name:"test",call:"http://localhost:3000/2021-08/queue/info",destroy:"auto"})
        next();
    })
    app.get("/unique",(req,res,next)=>{
        queue.add({name:"unique",unique:"keep_the_last"})
        next();
    })
    app.get("/echo",(req,res,next)=>{        
        console.log("==========================","received","==========================")
        res.end();
    })
    app.get("/createSSL",(req,res,next)=>{        
        queue.add({name:"ssl devs.secmedhub.com",call:"http://localhost:3000/2021-08/queue/example/echo",unique:"keep_the_first",priority:"high"})
        next();
    })
    app.get("/schedule",(req,res,next)=>{
        var date = new Date();
        queue.add({
            name:"schedule",
            scheduled:`0 ${date.getMinutes()+1} ${date.getHours()} ${date.getDate()} ${date.getMonth()+1} ?`,
            call:"http://localhost:3000/2021-08/queue/info",
            destroy:"auto"
        })
        next();
    })
    app.use(async (req,res,next)=>{
        res.json({
            size:await queue.size(),
            list:await queue.list(),
            onExecute:queue.onExecution,
            start:`${req.protocol}://${req.get("host")}/2021-08/queue/start`
        })
    })
module.exports=(value)=>{
    queue=value;
    return app;
};