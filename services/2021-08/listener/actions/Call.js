const Action = require("../Action");
const Queue = require("../util/Queue");

class Call extends Action{
    constructor(data){        
        super();

        this.beforeUrl=data.before;        
        this.afterUrl=data.after;
                  
        if(data.queue) {
            this.queue= new Queue(data.queue,data.delay)                    
            this.queue.consume(async (message)=>{
                console.log("Listener call",this.afterUrl,message)
                try{
                    var result = await this.services[this.afterUrl](message)
                    if(!result) throw new Error("generic error in listener Call")
                }catch(e){
                    console.log("received queue err",e);
                    throw e;
                }
            },data.delay||0)
        }
    }
    async before(id,request){
        if(!this.beforeUrl) return;
    }
    async after(id,request,response){
        if(!this.afterUrl) return;        
        if(this.queue) this.queue.produce(request.data);   
        else this.services[this.afterUrl](request.data)

    }
}
module.exports=Call