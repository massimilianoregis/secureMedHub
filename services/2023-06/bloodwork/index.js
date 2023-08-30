
var {Service} =require("service-libs");
var BloodWork = require("./BloodWork");

const app = new Service()
	.addDefaultConfig()	
	.addJsDoc(__dirname)
	.app

app.addRest(BloodWork);
module.exports=app;