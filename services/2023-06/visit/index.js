
var {Service} =require("service-libs");
var Visit = require("./Visit");
var Dermatologist = require("../dermatologist/Visit");

const app = new Service()
	.addDefaultConfig()	
	.addJsDoc(__dirname)
	.app

app.get("/",(req,res,next)=>{
	var visits =require("./visitTypes")
	visits.forEach(visit=>
		visit.assessments.forEach(assessment=>{
			assessment.component=assessment.component||"assessments/General"	
		})
		)
	res.json(visits)
})
app.get("/patient/:patient",async (req,res,next)=>{
    var generics = await Visit.find({patientId:req.params.patient})	
	var dermatologist = await app.services.dermatologist({patientId:req.params.patient})
console.log(dermatologist)
    res.json(generics.concat(dermatologist))
})
app.addRest(Visit);
module.exports=app;