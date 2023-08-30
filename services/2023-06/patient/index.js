try{
var {Service} =require("service-libs");
var Patient = require("./Patient");

const app = new Service()
	.addDefaultConfig()	
	.addJsDoc(__dirname)
	.app

app.use("/:id",(req,res,next)=>{
	req.patient={id:req.params.id}
	next()
})
app.get("/:id/visit",async (req,res,next)=>{	
	var visits=await app.services.visit({patientId:req.patient.id});
	res.json(visits)
})
app.get("/:id/ranges",async (req,res,next)=>{	

	res.json({
		"id":"9ed9754f-20a3-4dee-8bd7-19226cf5419b",
		"first_name": "Max",
		"last_name": "Regis",
		"birth_date": "08/06/1977",
		"bloodPressure":{
		  "Systolic": {"unit": "mmHg", "min": 90, "max": 120, "value": 110},
		  "Diastolic": {"unit": "mmHg", "min": 60, "max": 80, "value": 90}
		},
		"heartRate": {"unit":"bpm","max":100,"value":70},
		"respiratoryRate": null,
		"bodyTemperature": 36,
		"oxygenSaturation": {"unit":"%","min":96,"value":98},
		"bodyWeight": 78,
		"bodyHeight": 175,
		"blood":{
		  "glucose": {"unit": "mg/dL", "min": 70, "max": 100, "value": 90},
		  "creatinine": {"unit": "mg/dL", "min": 0.7, "max": 1.3, "value": 1.0},
		  "blood_urea_nitrogen": {"unit": "mg/dL", "min": 8, "max": 20, "value": 15}
		},
		"cholesterol": {
		  "Total": {"unit": "mg/dL", "min": 100, "max": 200, "value": 160},
		  "LDL": {"unit": "mg/dL", "min": 0, "max": 130, "value": 120},
		  "HDL": {"unit": "mg/dL", "min": 40, "max": 60, "value": 50},
		  "Triglycerides": {"unit": "mg/dL", "min": 0, "max": 150, "value": 100}
		},
		"kidneyFunction": {
		  "Creatinine": {"unit": "mg/dL", "min": 0.7, "max": 1.3, "value": 1.0},
		  "Blood Urea Nitrogen (BUN)": {"unit": "mg/dL", "min": 8, "max": 20, "value": 15},
		  "Estimated Glomerular Filtration Rate (eGFR)": {"unit": "mL/min/1.73m²", "min": 90, "max": 120, "value": 100},
		  "Albumin/Creatinine Ratio - ACR":{"unit": "mg/g", "min": 0, "max": 30, "value": 10}
		},
		"hormonal_values": {
		  "cortisol": {"unit": "µg/dL", "min": 10, "max": 25, "value": 15},
		  "thyroxine": {"unit": "µg/dL", "min": 4.5, "max": 12, "value": 7.2},
		  "insulin": {"unit": "µIU/mL", "min": 2, "max": 10, "value": 5},
		  "estradiol": {"unit": "pg/mL", "min": 20, "max": 60, "value": 40}
		},
		"electrolytes": {
		  "Sodium": {"unit": "mEq/L", "min": 135, "max": 145, "value": 140},
		  "Potassium": {"unit": "mEq/L", "min": 3.5, "max": 5, "value": 4},
		  "Calcium": {"unit": "mg/dL", "min": 8.5, "max": 10.5, "value": 9.2},
		  "Magnesium": {"unit": "mEq/L", "min": 1.5, "max": 2.5, "value": 2},
		  "Phosphorus": {"unit": "mg/dL", "min": 2.5, "max": 4.5, "value": 3.2}
		}
	  }
	  )
})
app.addRest(Patient);
module.exports=app;
}catch(e){
	console.log(e)
}