var udp = require('dgram');
var client = udp.createSocket('udp4');

class Client{
    constructor(url,port){
        this.url=url;
        this.port=port;
        
    }
    enableReceiving(){
        client.on('message',function(msg,info){
            console.log('Data received from server : ' + msg.toString());
            console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
          });
        return this;
    }
    send(data){
        const {port,url} = this;
        return new Promise((ok,ko)=>{
            data = JSON.stringify(data);
            client.send(data,port,url,function(error){
                if(error){
                    ko(error)
                }else{
                    ok()
                }
          });
        })
    }
}
