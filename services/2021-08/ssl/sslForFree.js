const FormData = require('form-data');
const fetch = require("node-fetch");
const path = require("path")
const fs = require("fs")
const bodyParser = require("body-parser")
class SSLForFree{
	constructor(accessKey){
		this.accessKey=accessKey
		this.challengePath = path.resolve(__dirname,"challenge")
	}
	saveChallenge(name,content){
		try{fs.mkdirSync(this.challengePath,{recursive:true})}catch(e){}
		const file = path.resolve(this.challengePath,name);
		fs.writeFileSync(file,content.join("\r\n"));
	}
	getApp(){
		var challengePath = this.challengePath;
		var express= require("express");
		var app= express();		
		
		app.use("/.well-known/pki-validation/",express.static(challengePath,{
			setHeaders:(res)=>{res.setHeader("Content-Type", "text/plain");}
		}))
		return app
	}
	async wait(millis){
		return new Promise((ok,ko)=>{
			setTimeout(ok,millis)
		})
	}
	async checkCertificate(domain){
		console.log("ssl","check")
		var certificate = await this.findValidCertificate(domain);
		try{
			await this.installCertificate(certificate.id);	
		}catch(e){}
		if(certificate) return {
			msg:"already valid",
			certificate:certificate
		};
		certificate = await this.createAndVerify(domain);		
	 	await this.installCertificate(certificate.id);	
		
		return {msg:"created a new one",certificate:certificate};
	}
	async installCertificate(id){	
		console.log("ssl","install")		
		await this.wait(10000);
		
		var {certificate,bundle}= await this.getFile(id);	
		const certFile= path.resolve(certPath,"certificate.crt")
		const bundleFile= path.resolve(certPath,"ca_bundle.crt")
		if(fs.readFileSync(certFile).toString()==certificate && fs.readFileSync(bundleFile).toString()==bundle) return ko();

		fs.writeFileSync(certFile,certificate);
		fs.writeFileSync(bundleFile,bundle);						
	}
	get csr(){		
		const file = path.resolve(certPath,"csr.crt");
		return fs.readFileSync(file).toString()	
	}
	
	async createAndVerify(domain,csr=null){		
		console.log("ssl","createAndVerify")		
		csr=csr||this.csr;
		var data = await this.generateCertificate(domain,csr);
		const id = data.id;
		const {file_validation_url_http,file_validation_content}=data.validation.other_methods[domain]
		console.log("file validation content",file_validation_content)
		this.saveChallenge(
			path.basename(file_validation_url_http)
			,file_validation_content)				
		var result =await this.verifyDomain(id);
		console.log(JSON.stringify(result,2,2))
		await this.wait(5000)
		return data;
	}
	async getFile(id){
		console.log("ssl","getFile",id)		
		var obj = await this.get(`certificates/${id}/download/return`)
		return {
			certificate:obj["certificate.crt"],
			bundle:obj["ca_bundle.crt"]
		}
	}
    async getValidCertificates(name){
		return (await this.getCertificates()).results.filter(item=>
            item.status=="issued" && (!name || item.common_name==name));
	}
	async getCertificates(){
		return await this.get("certificates");
	}
	async findValidCertificate(domain){
		console.log("ssl","findCertificate")		
		var list = await this.getCertificates()
		return list.results.find(cert=>cert.common_name==domain && (cert.status=="issued" || cert.status =="expiring_soon"))
	}
	async findCertificates(domain){
		console.log("ssl","findCertificate")		
		var list = await this.getCertificates()
		return list.results;
	}
	async verifyDomain(id){
		console.log("ssl","verify domain")		
		return await this.post(`certificates/${id}/challenges`,{validation_method:"HTTP_CSR_HASH"})
	}
	async generateCertificate(domain,csr=null){		
		console.log("ssl","generate certificate")		
		csr=csr||this.csr
		return await this.post("certificates",{
			certificate_domains:domain,
			certificate_validity_days:90,
			certificate_csr:csr,
		})
	}
	async call(url,method,params){			
		var opt = {
			method:method.toUpperCase(),
			headers: { 
				'Content-Type': 'application/json'
			},			
		}
		if(params) 	{
			const form = new FormData();
			var keys = Object.keys(params)
			keys.forEach(key=>{
				form.append(key, params[key]);
			})			
			opt.body=form
			opt.headers=form.getHeaders()
		}
		try{				
			const res= await fetch(`https://api.zerossl.com/${url}?access_key=${this.accessKey}`,opt);
			var json =await res.json()
			
			return json;
		}catch(e){
			console.log("sslCall",e);
		}		
	}
	async post(url,data){		
		return await this.call(url,"post",data)
	}
	async get(url){		
		return await this.call(url,"get")
	}
}
module.exports=SSLForFree