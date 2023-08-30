
/*
    name: event name
    priority:   high,medium,low
    creation_time:
    unique: keep_the_last
            keep_the_first
    scheduled:  time
                asap
                * * *                
    destroy:    auto
    call:       url         :used to perform a call
 */
const Event = require("./event");
const schedule = require('node-schedule');
const {WebHook} = require("./listener");
var requestify= require("requestify");
var {v4:uuid} = require("uuid");
const moment = require("moment")

class Queue{
    constructor(jwt){
        this.jwt=jwt;
        this.source=Event;
        this.listeners=[]
        this.onExecution=false;             
    }
    async loadSchedule(){        
        //I have to add events on schedule
        const list = await Event.find({scheduled:{$exists:true}});
        list.forEach(event=>{        
            schedule.scheduleJob(event.scheduled,()=>{
                this.execute(event.id)   
            })            
        })
    }

    async size(){
        return await this.source.count();
    }    

    async add(event){       
        try{
        event.destroy=event.destroy||"auto"
        
        //if unique
        if(event.unique){
            if(event.unique=="keep_the_last"){
                //remove all the previous events
                await Event.deleteMulti({name:event.name})
                //add me
                await Event.new(event);
            }
            if(event.unique=="keep_the_first")                
                    try{await Event.new(event);}catch(e){console.log(e)}

            if(this.added) this.added();
            return;
        }

        //if scheduled
        if(event.scheduled){
                //if asap add event on queue
                Event.new(event);
                            
                //add to node-schedule
                schedule.scheduleJob(event.scheduled,()=>{                    
                    this.execute(event.id)                    
                })
            
            return;
            }
        
        await Event.new(event);        
        if(this.added) this.added();
        }catch(e){console.log(e)}
    }

    addListener(listener){
        this.listeners.push(listener);
    }    
    addWebHook(url,jwt){
        this.listeners.push(new WebHook(url,jwt))
    }

    async call(url,method="GET",data={},jwt){
        if(url.startsWith("GET")) {method="GET"; url=url.substring(4); }
        method=method.toUpperCase();
        if(url.startsWith("/")) url=this.gateway+url        
        if(method=="GET")
            await requestify.get(url,{headers:{auth:jwt||this.jwt},timeout:1000000})
        else
            await requestify[method.toLowerCase()](url,data,{headers:{auth:jwt||this.jwt},timeout:1000000})
    }
    async notify(event){
        if(event.call) return await this.call(event.call,event.method,event.data);
        await Promise.allSettled(this.listeners.map(item=>item.notify(event)));
    }

    pidExists(pid) {
        try {
          process.kill(pid, 0);
          return true;
        } catch(e) {
          return false;
        }
      }
    async count(){
        return await this.source.count({scheduled:{$exists:false}});
    }
    async isInExecution(){
        var list =  await this.source.find({execution:{$exists:true}});
        
        list = list.filter(item=>{
            try{
                const {process} =item.execution;
                var alive = this.pidExists(process)            
                if(!alive) this.resume(item.id);
                return alive;
            }catch(e){return true;}
        })
        
        return list.length>0
    }
    async resume(id){
        if(id)
            await this.source.update({id:id},{$unset: { execution: true } })
        else
            await this.source.update({execution:{$exists:true}},{$unset: { execution: true } })
        this.start()
    }
    async next(){        
        var current = {
            id:uuid(),
            process: process.pid
        };    
        if(await this.isInExecution()) return;
        //looking for the next
    
        var date = moment().subtract(5,"seconds").toDate();
        await this.source.update({
            creation_time:{$lt:date},
            scheduled:{$exists:false},
            error:{$exists:false},
            execution:{$exists:false}
        },{$set:{execution:current}})
    
        var obj = await this.source.get({"execution.id":current.id});
    
        return obj;
    }    
    async execute(id){
        var next;
        try{
            if(!id)
                next=await this.next();                    
            else
                next=await Event.get({id:id});

            if(!next) return null;        

            await this.notify(next);        
            console.log("\t","queue".green,"notified");
            if(next.destroy && next.destroy=="auto")  {
                console.log("\t","queue".green,"delete");
                await next.delete();
            }
        }catch(e){
            if(next)               
                await this.source.update({id:next.id},{$unset:{execution:true},$set:{error:e}});            
        }
        
        return next;
    }
    async delete(id){
        await this.source.delete(id)
    }
    async clean(){
        await this.source.deleteMulti({execution:{$exists:true}})
    }
    async clear(){
        await this.source.deleteMulti({})
    }

    async wait(millis){
        return new Promise((ok,ko)=>{
            setTimeout(ok,millis);
        })
    }
    async added(){
        setTimeout(()=>this.start(),6000);
    }

    async start(){  
        await this.wait(Math.random() * 2000)            
        var next;
        do{            
            next = await this.execute();            
        }while(next)        
    }

    async list(){
        return await this.source.find({},0,100,{creation_time:1});
    }
}

module.exports=Queue;