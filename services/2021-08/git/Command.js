const { exec } = require("child_process");
class Command{
	constructor(dir){
		this.dir=dir;
	}
	async exec(cmd){
		console.log("command:",this.dir,cmd)
		return new Promise((ok,ko)=>{
			exec(cmd,{
				cwd: this.dir
			  }, (error, stdout, stderr) => {
				  console.log("\tcommand:",stdout, stderr)
				if(error) ko(stderr);
				else ok(stdout);
			})
		})		
	}
}
module.exports=Command;