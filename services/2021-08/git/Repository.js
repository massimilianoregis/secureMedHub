const { Document }= require("service-libs")
const Command = require("./Command")
const fs = require("fs")
const path = require("path")
class Repository extends Document{		
	static configDB(db){
		db.ensureIndex({ fieldName: 'git', unique: true })
	}
	
	getDir(){
		var dir = this.dir;
		const root=path.resolve(process.cwd(),"..");	
		const rootServices=path.resolve(process.cwd(),"services");	

		if(dir.startsWith("root://"))		return path.resolve(root,dir.substring("root://".length));
		if(dir.startsWith("services://"))	return path.resolve(rootServices,dir.substring("services://".length));
		return dir;
	}
	async pull(){
		return await new Command(this.getDir()).exec(`git pull`)
	}
	async clone(defaultRepository){
		var {branch,git} = this;
		var dir = this.getDir();

		var repository = git;
		if(!git.startsWith("http")) repository= defaultRepository+git+".git";
		
		console.log("clone",repository,branch,dir)			
		
		fs.mkdirSync(dir, { recursive: true });
        branch=branch?branch=`--branch ${branch}`:"";
            console.log("========>",dir,`git clone ${repository} ${branch} .`)
		await new Command(dir).exec(`git clone ${repository} ${branch} .`)
	}
	async deploy(){
		console.log("compile")
		
		var cmds = this.after;
		if(typeof(cmds)=="string") cmds = cmds.split(/[\r\n;]/).map(item=>item.trim()).filter(item=>item.length>0)
		cmds=cmds||[];
		var dir = this.getDir()
		for(var i in cmds){
			var cmd = cmds[i];						
			if(cmd.match(/^\/\//))     ;
			else if(cmd.match(/^GET/)) 	await Repository.services.get(cmd.substring(4));						
			else						await new Command(dir).exec(cmd);
		}		
	}
	
	toJSONDB(){
		return {
			id:this.id,
			name:this.name,
			git:this.git,
			branch:this.branch,
			dir:this.dir,
			after:this.after,
            notify:this.notify
		}
	}
}
module.exports=Repository;