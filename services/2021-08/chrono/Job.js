const { Document } = require("service-libs");
const schedule = require('node-schedule');

class Job extends Document{
    constructor(data){
        super(data);
        this.time=data.time;
        this.action=data.action;
    }
    execute(){}
    schedule(){
        schedule.scheduleJob(this.time, ()=>{this.execute()});
    }
    toJSONDB(){
        return {
            time:this.time,
            action:this.action.constructor.name            
        }
    }    
}
module.exports = Job;