const path = require("path")
const Repository = require("./Repository")

class Git {
	constructor(){		
		this.root=path.resolve(process.cwd(),"..");	
		this.rootServices=path.resolve(process.cwd(),"services");	
		this.repository=Repository;
	}
	async list(){
		return await Repository.find({});
	}
	
	async onWebhook(event){				
		var repository=event.repository.name;
		var branch=event.ref.replace("refs/heads/","");   
		var info = await Repository.get({name:repository,branch:branch});
		if(info==null) return;		


		await this.onSync(info)
	}
	async init(name,git,branch,dir,after){		
		console.log('==========INIT==========')			
		console.log("git","init",name,git,branch,dir,after)
		name=name||git.replace(/\//gi,"");

		if(!git.startsWith("http")) git= this.defaultRepository+git+".git";
		var rep;
		try{			
			rep= await Repository.new({
				name:name,
				git:git,
				branch:branch,
				dir:dir,
				after:after
			})}
		catch(e){						
			rep = await Repository.get({name:name})
			await rep.update({
				name:name,
				git:git,
				branch:branch,
				dir:dir,
				after:after
			});
			}		
		await this.onSync(rep)
	}
	async onSync(repository){	
		console.log('==========ONSYNC==========')
		const {git,dir,branch}=repository;
		var {environment} = await  Git.services.environment()
		var result;
		this.notifyStart(repository,environment)
		try{
			result = await repository.pull()			
		}catch(e){
			await repository.clone(this.defaultRepository)
		}finally{						
				try{
					await repository.deploy();
					await this.notifyOk(repository,environment)	
				}catch(e){
					await this.notifyKo(repository,environment)	
				}			
		}
	}

	async notifyAll(list,message){
		for(var i in list){			
			if(list[i].slack)
				await Git.services.notify({to:list[i].slack,message:message})
		}
	}
	async notifyAlreadyUp(repository,environment){
		var {name,branch}=repository;
		this.notifyAll(repository.notify,`hei.... CD/CI:${name}/${branch} already up to date ${environment}`)
	}
	async notifyStart(repository,environment){
		var {name,branch}=repository;
		this.notifyAll(repository.notify,`hei.... CD/CI:${name}/${branch} new push ${environment}`);
		
	}
	async notifyOk(repository,environment){
		var {name,branch}=repository;
		this.notifyAll(repository.notify,`hei.... CD/CI:${name}/${branch} deployed on ${environment}`);		
	}
	async notifyKo(repository,environment){
		var {name,branch}=repository;
		this.notifyAll(repository.notify,`hei.... CD/CI:${name}/${branch} compiled error on ${environment}`);	
	}	
	
	
}




module.exports=Git