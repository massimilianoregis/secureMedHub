try{
const {Service} =require("service-libs");
const Visit = require("./Visit");
const Assessment = require("./assessment");
const Prescription = require("./prescription");
const Procedure = require("./procedure");

const app = new Service()
	.addDefaultConfig(()=>{
		Visit.services=app.services;
	})	
	.addJsDoc(__dirname)
	.app

app.use("/procedure",Procedure)
app.use("/prescription",Prescription)
app.use("/assessment",Assessment)
app.addRest(Visit,"/visit");
module.exports=app;
}catch(e){console.log(e)}