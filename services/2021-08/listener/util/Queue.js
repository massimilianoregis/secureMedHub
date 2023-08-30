const moment = require("moment-timezone");
var { Producer } = require('sqs-producer');
var { Consumer } = require('sqs-consumer');
const { uuid } = require("uuidv4");

class Queue{
    constructor(queueName){        
        var {region} = queueName.match(/sqs\.(?<region>.*)\.amazon/).groups
        this.name=queueName;
        this.region=region;       
    }

    get producer(){
        if(this._producer) return this._producer;
        this._producer = Producer.create({
            queueUrl: this.name,
            region:this.region    
        })
        return this._producer;
    }
    async produce(data){        
        data.created_at=new Date();
        console.log("\tQueue","produce",{id:uuid(),body:JSON.stringify(data)})
        await this.producer.send([{id:uuid(),body:JSON.stringify(data)}]);
    
    }

    
    async consume(fnc,delay){
        console.log("consume",delay)
        var {time,unit}=delay.match(/(?<time>\d*) (?<unit>.*)/).groups

        console.log("consume",this.name,this.region)
        this.consumer = Consumer.create({
            queueUrl: this.name,
            region: this.region,           
            handleMessage: async (message) => {                             
                message = JSON.parse(message.Body)                                                      
                console.log("Queue","consume",message)                 
                message.created_at= moment(new Date(message.created_at).toISOString());                
            
                console.log("Queue","consume",moment().diff(message.created_at,unit))
                if(moment().diff(message.created_at,unit)>time) 
                        return await fnc(message);                             
                
                throw new Error("Not executable now");
          }
        });
        this.consumer.start()
    }
}
module.exports=Queue