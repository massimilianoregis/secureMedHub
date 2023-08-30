const bodyParser= require("body-parser");
const path = require("path")

class Rest{
	constructor(obj, app){
		this.obj=obj;
		console.log("service".yellow,obj.name.yellow)
		this.app = app||require("express")();
		this.app.use("/:id",async(req,res,next)=>{
			req.obj= await this.obj.get({id:req.params.id})
			next()
		})	
		this.populate();
		this.all();
		this.get();	
		this.create();
		this.update();	
		this.delete();	
		this.error();
	}

	all(){
		this.app.get("/",async(req,res,next)=>{
			var {count,page,pageSize,sort} = req.query;
			page = parseInt(page||0);
			pageSize = parseInt(pageSize||20);
			sort = sort?{[sort]:-1}:null

			var query={};			
			for(var key in req.query){				
				var value = req.query[key];

				if(Array.isArray(value)) 
					value={$in:value[0]}
								
				query[key]=value;
				if(this.query) this.query(query);
			}

			delete query.page;			
			delete query.pageSize;
			delete query.count;		
			delete query.sort;		

			
			var list = await this.obj.find(query,page,pageSize,sort)		
			if(count) return res.json({count:await this.obj.count(query),list:list})
			res.json(list)
		})
	}
	get(){
		this.app.get("/:id",async(req,res,next)=>{				
				var {content}= req.query	
				
				if(req.obj && content){
					var capitalize =content.charAt(0).toUpperCase() + content.slice(1);
					await req.obj[`load${capitalize}`]()
				}
					
				res.json(req.obj);
			})
	}
	create(){
		this.app.post("/",bodyParser.json(),async(req,res,next)=>{				
			try{
				res.json(await this.obj.new(req.body,req.user));
			}catch(e){
				next(e);
			}
			})
	}
	update(){		
		this.app.put("/:id",bodyParser.json(),async(req,res,next)=>{				
				try{
					Object.assign(req.obj,req.body);
					await req.obj.save(req.user);
					res.json(req.obj);
				}catch(e){
					next(e);
				}
			})
	}
	delete(){		
		this.app.delete("/:id",async(req,res,next)=>{				
				try{
					await req.obj.delete();
					res.json(req.obj);
				}catch(e){
					next(e);
				}
			})
	}
	error(){		
		this.app.use(async(err,req,res,next)=>{				
				res.status(500).send({error:err});
			})
	}
	populate(){
		this.app.get("/populate",async(req,res,next)=>{
				var obj = await this.obj.new(this.obj.populate(),req.user)
				res.json(obj);
			})
	}
}

module.exports=Rest