
var {Service} =require("service-libs");
var Procedure = require("./Procedure");

const app = new Service()
	.app

app.addRest(Procedure);
module.exports=app;