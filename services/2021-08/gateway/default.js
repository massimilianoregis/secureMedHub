const Gateway = require("./gateway");

async function init(gateway){
    try{    
        gateway.enableCompression();
        gateway.accessControl();                            
        await gateway.discoverServices();                         

        gateway.redirectWhenError();        
        gateway.ready();        
    }catch(e){
        gateway.error(e)
        console.log(e)
    }
}

module.exports = {
    start(){
        const gateway = Gateway.newInstance();    
          //  gateway.addWelcomePage();    
        gateway.listen();

        init(gateway);        
    }
}


