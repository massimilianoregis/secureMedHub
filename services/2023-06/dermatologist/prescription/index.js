
var {Service} =require("service-libs");
var Prescription = require("./Prescription");

const app = new Service()
	.app

app.addRest(Prescription);
module.exports=app;