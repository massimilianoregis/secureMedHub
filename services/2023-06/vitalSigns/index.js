
var {Service} =require("service-libs");
var VitalSigns = require("./VitalSigns");

const app = new Service()
	.addDefaultConfig()	
	.addJsDoc(__dirname)
	.app

app.addRest(VitalSigns);
module.exports=app;