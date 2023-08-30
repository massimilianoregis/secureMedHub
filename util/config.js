const fetch = require("node-fetch");
const path = require("path");
const colors = require('colors');
var root = process.cwd();


class Config{
	static instance(){
		if(!Config._instance)	Config._instance = new Config();
		return Config._instance;
	}	
	constructor(){
		Object.assign(this,require(path.resolve(root,`package.json`)));
		this.newconfig=require(path.resolve(root,`config.js`));
		Config._instance=this;
	}
	addVariables(){
		var str = JSON.stringify(this);		
		var vars = [...str.matchAll(/\$\{(?<var>.*?)\}/g)].map(item=>item.groups.var)
		vars.forEach(item=>{
			var value = this.newconfig[item];			
			if(value) str = str.replace(`\$\{${item}\}`,value)
		})
		Object.assign(this,JSON.parse(str));				
	}
	async load(callback){
		return new Promise(async (ok,ko)=>{
			var timer = setTimeout(()=>{
				this._timeout=true;
				this.addVariables();
				ok(this);
				console.log("config: basic configuration".green)
				try{
				var config = require(path.resolve(root,`127.0.0.1.js`));
				config(this);	
				}catch(e){}
				if(callback) callback(this);
			},1000)

			try{
				var response = await fetch("http://169.254.169.254/latest/meta-data/public-ipv4");				
				var ip = await response.text();
			
				console.log("config: "+ip)
				var config = require(path.resolve(root,`${ip}.js`));
				config(this);										
			}catch(e){}
			finally{
				clearTimeout(timer);
				if(!this._timeout){
					this.addVariables();
					ok(this);
					if(callback) callback(this);
				}
			}
		})
	}
}

module.exports=Config.instance()