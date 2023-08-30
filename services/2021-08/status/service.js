const moment = require("moment-timezone")
class Status{
    constructor(){
        this.services={};
    }
    reset(){
        this.services={};
    }
    push(info){              
        var {heartbeat,pid,endpoint}= info

        
        var current = this.services[endpoint]||Object.assign(info,{heartbeat:[]})           
        this.services[endpoint]=current;
        current.heartbeat=current.heartbeat.filter(item=>item.pid!=pid)
        current.heartbeat.push(heartbeat)
                        
        heartbeat.last=moment().toDate();        
        heartbeat.pid=pid;
        
        delete current.endpoint;
        delete current.pid;
    }
    toJSON(){        
        var json = Object.assign({},this);        
        for (var endpoint in json.services){
            const service = json.services[endpoint];
            
            for(var i in service.heartbeat){
                var heartbeat= service.heartbeat[i];
                heartbeat.when=moment(heartbeat.last).toNow()
                heartbeat.status="ok"
                heartbeat.delay=new Date()-new Date(heartbeat.last);
                if(heartbeat.delay>heartbeat.interval)
                    heartbeat.status="ko"
            }
        }
        return json;
    }
}
module.exports=Status