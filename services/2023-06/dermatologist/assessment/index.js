
var {Service} =require("service-libs");
var Assessment = require("./Assessment");

const app = new Service()
	.app

app.addRest(Assessment);
module.exports=app;