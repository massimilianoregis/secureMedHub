const schedule = require('node-schedule');
const ClassCreator= require("./ClassCreator")
const {Service} = require("service-libs");

var list=[];
var app = new Service()
    .addDefaultConfig((config,app)=>{
        var {defaultClass,jobs} = config;        
        Job.services=app.services;
        var cls = new ClassCreator("./jobs",defaultClass)        

        jobs.forEach(job=>{
            var jobcls = cls.create(job);            
            jobcls.schedule();
            list.push(jobcls)
        })                    
    })
    .setAsSingleton(3904)
    .addInfo()    
    .app


app.get("/",(req,res,next)=>{
    res.json(list);
})

module.exports=app;