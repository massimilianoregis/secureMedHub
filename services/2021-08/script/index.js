var {Service}=require("service-libs");
const app = new Service()
    .addDefaultConfig()
    .addInfo()
    .app

const { Parser } = require('json2csv');
const { transforms: { unwind, flatten } } = require('json2csv');
	

app.get("/:name/:value",async (req,res,next)=>{
    const {name,value}=req.params;    
    var script=require(`./${name}`);
        script.services=app.services;
    var result = await script[value](req.query)

    if(result&&result.type=="csv"){
        res.set('Content-Type', 'text/csv'); 

        const json2csvParser = new Parser({ delimiter: '\t'});	
        return res.send(json2csvParser.parse(result.result));
    }
    res.json(result);
    })
module.exports=app;