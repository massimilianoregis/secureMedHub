const Gateway = require("./services/2021-08/gateway/gateway");
var config = require("./util/config");
require("moment-timezone").tz.setDefault("America/Los_Angeles");
	
console.log("=============================")
console.log(process.argv)
console.log("=============================")
	
async function start(endpoint,port){	
	console.log("===",endpoint,port,"===")
	//create a gateway
	const discover = Gateway.newInstance().discover;    	
	
	//create Service
	const service = await discover.getIndexService(endpoint);
	if(port) {
		console.log("listen on ",port)
		service.listen(port);
		console.log("service",endpoint.green,port.green,"online")
	}
}

config.load(async ()=>{	
	if(process.argv[3]) return start(process.argv[2],process.argv[3]);	
	
	(await Gateway.getInstance("/2021-08/gateway")).startup();	
})

process.on('unhandledRejection', (reason, promise) => {
	console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('unhandledException', function onError(err) {
	console.log(err)
});

