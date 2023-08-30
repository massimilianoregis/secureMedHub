
var {Service} =require("service-libs");
var Prescription = require("./Prescription");

const app = new Service()
	.addDefaultConfig()	
	.addJsDoc(__dirname)
	.app

app.addRest(Prescription);
module.exports=app;