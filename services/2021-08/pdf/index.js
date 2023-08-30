const { S3 } = require("aws-sdk");

try{
const path = require("path");
const fs = require("fs");
const {Service} = require("service-libs")
const {Lambda} = require("./service")
var app = new Service()
	.addDefaultConfig((config,gatewayApp)=>{		
	})
	.app

	app.all("/",async (req,res,next)=>{
		var {url,jwt} = Object.assign(req.query,req.body);
		var data = await pdf.create(url,jwt)
		
		res.setHeader('Content-Type', 'application/pdf');
		res.send(data)
	})


module.exports=app;
}catch(e){
	console.log(e);
}