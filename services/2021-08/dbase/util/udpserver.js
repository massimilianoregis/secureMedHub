var udp = require('dgram');
const { send } = require('process');
var server = udp.createSocket('udp4');
var {UDP} = require("service-libs")

class Server{
    constructor(){
        this.actions={};
        this.bufferSize=5000;
    }
    listen(port){
        server.on('listening',function(){
            var address = server.address();
            var port = address.port;
            console.log(`Server UDP is listening at port ${port}`);
          });
        UDP.Call.setSocket(server);
        server.bind(port);
    }
    action(name,fnc){
        this.actions[name]=fnc
        return this;
    }

    enableReceiving(){
        server.on('error',async (error)=>{
            console.log("error","udpServer")
        })
        
        server.on('message',async (msg,info)=>{
            msg = JSON.parse(msg);
            const {uuid,method,data} = msg;
            const {port,address} = info
                        
            var result;
            var error;

            if(method=="end") return UDP.Call.delete(uuid) 
            if(method=="token") return UDP.Call.resend(data.i,uuid) 

            try     {result=await this.actions[method](data);}
            catch(e){error=true;result=e}
            
            UDP.Call.send(address,port,result,uuid)                      
          });
        return this;
    }

    async send(data,port,address){
        return new Promise((ok,ko)=>{
            server.send(data,port,address,err=>{
                if(err) ko(err);
                ok();                    
            });
        })
    }
}

module.exports= Server;


  