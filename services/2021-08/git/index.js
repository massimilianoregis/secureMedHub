try{
var Git = require("./git");
var gitService= new Git();
const {Service} = require("service-libs");

const bodyParser=require("body-parser")
var app = new Service()
	.addDefaultConfig()
	.addJsDoc(__dirname)
	.app

app.get("/",(req,res,next)=>{
	console.log("@@@@@@@")
	res.end('clo')
})

    app.use(bodyParser.json());
	//webhook for github
	app.all("/push",async (req,res,next)=>{				
		await gitService.onWebhook(req.body);
		res.end("OK");	
	})	
	app.post("/install",async (req,res,next)=>{	
		console.log('==========GIT INSTALL==========')
		try{				
			const {name,git,branch,dir,after} = Object.assign(req.body,req.query)					
			await gitService.init(name,git,branch,dir,after)
			res.json({})
		}catch(e){
			console.log(e)
			res.status(500).send({error:e})
		}
    })	
	app.get("/install/ionic",async (req,res,next)=>{
		try{	
		const {git,branch,save} = req.query;
		var {name} = req.query;
		name=name||git;
		
		await gitService.init(
			name,`/${git}`,
			branch||"develop",
			`root://${name}`,
			` npm i;
			ionic build --prod;`)     
		}catch(e){
			res.status(500).send({error:e})
		}      
	})
	

	app.get("/sync/:name(*)",async (req,res,next)=>{
		await gitService.onSync(req.params.name)
		res.json({})
	})
	app.post("/",bodyParser.json(),async(req,res,next)=>{		
		const {name,git,branch,dir,after} = Object.assign(req.body,req.query)
		await gitService.init(name,git,branch,dir,after)
	})
	
	
	
	app = new Service(app)
		.addInfo()
		.addRest(gitService.repository,"/repository")
		.setAsSingleton(3903)
		.addJsDoc(__dirname)
		.addDefaultConfig(config=>{
			gitService.defaultRepository=config.defaultRepository;
			Git.services= app.services;
		}).app;

	app.get("/repository/:id/notify/slack/:slackCode",async (req,res,next)=>{
		req.obj.notify=req.obj.notify||[];
		req.obj.notify.push({
			slack:req.params.slackCode	
		})
		await req.obj.save();
		res.json(req.obj)
	});
	app.get("/repository/:id/after",async (req,res,next)=>{
		await req.obj.deploy();
		res.json({})
	});

	app.get("/repository/:id/deploy",async (req,res,next)=>{
		await req.obj.deploy();
		res.json({})
	});
	app.get("/repository/:id/pull",async (req,res,next)=>{
		await req.obj.pull();
		res.json({})
	});
module.exports=app

}catch(e){console.error(e)}