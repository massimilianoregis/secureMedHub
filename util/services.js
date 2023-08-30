var requestify= require("requestify");	
const path=require("path");
const querystring = require('querystring');
var ws = require("./websocket")
var klaviyo
	var services={
		config:function(config){
			this.gateway=config.gateway;
			this.externalGateway=config.external;
			this.jwt=config.jwt;	
			if(config.klaviyo)	
				klaviyo=new (require('klaviyo-node'))(config.klaviyo);	
		},
		gateway:"http://localhost",
		connections:0,
		get:async (url,params,jwt)=>{
			return new Promise(async (ok,ko)=>{
				console.log(`\tGET:${url}`)				
				if(url.startsWith("/")) url=`${services.gateway}${url}`;
				var headers={}	
				if(services.jwt) 	headers.auth=services.jwt;	
				if(jwt)				headers.auth=jwt;	
				try{
					url=encodeURI(url);
					services.connections++;		
					var data = await requestify.get(url,{headers:headers,insecure: true,params:params,timeout:10000})
					ok(data.getBody())
				}
				catch(e){
					ko(e);
				}
				finally{
					services.connections--;
				}

			})			
		},		
		post:async (url,body,jwt)=>{
			return new Promise(async (ok,ko)=>{
				console.log(`\tPOST:${url}`)
				if(url.startsWith("/")) url=`${services.gateway}${url}`
				var headers={}			
				if(services.jwt) headers.auth=services.jwt;	
				if(jwt)				headers.auth=jwt;	
				try{
					url=encodeURI(url);
					services.connections++;
					var data = await requestify.post(url,body,{headers:headers,insecure: true,timeout:10000})

					ok(data.getBody())
				}
				catch(e){
					ko(e);
				}
				finally{
					services.connections--;
				}
			})				
		},
		delete:async (url,body,jwt)=>{
			return new Promise(async (ok,ko)=>{
				console.log(`\DELETE:${url}`)	
				if(url.startsWith("/")) url=`${services.gateway}${url}`
					
				var headers={}
			    if(services.jwt) headers.auth=services.jwt;	
			    if(jwt)				headers.auth=jwt;	
				try	{
					url=encodeURI(url);
					services.connections++;
					var data = await requestify.delete(url,{headers:headers,insecure: true,timeout:3000});
					ok(data.getBody())
				}
				catch(e){
					ko(e)
					console.log(e);
				}
				finally{
					services.connections--;					
				}
			})				
		},
		put:(url,body,jwt)=>{
			return new Promise(async (ok,ko)=>{
				if(url.startsWith("/")) url=`${services.gateway}${url}`
					
				var headers={}
				if(services.jwt) headers.auth=services.jwt;	
				if(jwt)				headers.auth=jwt;	
				try {
					url=encodeURI(url);
					services.connections++;
					var data = await requestify.put(url,body,{headers:headers,insecure: true,timeout:3000});
					ok(data.getBody())
				}
				catch(e){
					ko();
				}
				finally{
					services.connections--;					
				}
			})				
		},
		getString:(url)=>{
			return new Promise(async (ok,ko)=>{
	
				try {
					services.connections++;
					var data = await requestify.get(url,{timeout:3000});
					ok(data.getBody())
				}
				catch(e){
					ko();
				}
				finally{
					services.connections--;					
				}
			})	
		},
		hateous:(obj,name,url,type)=>{
			if(!obj) return;
			if(obj.forEach)
				return obj.forEach(item=>services.hateous(item,name,url,type))

			type=type||"links";
			url = eval('`'+url+'`');

			if(type=="links"){
				if(!obj.links) obj.links=[];
				var link = obj.links.find(item=>item.name==name)
				if(!link)	 obj.links.push({name:name,url:`${services.gateway}${url}`})
				else		Object.assign(link,{name:name,url:`${services.gateway}${url}`})
			}
			
			if(type=="short")
				obj[name]=`${services.gateway}${url}`
		},		
		websocket:ws,
		image:(src)=>{
			return `${services.externalGateway}/2020-09${src}`;
		},
		link:(url)=>{
			if(url.startsWith("/")) url=`${services.gateway}${url}`
			return url;
		},
		sendNotification:(type, mail, data)=>{
			klaviyo.track(type,mail,data)
		},
		externalLink:(path)=>{
			if(!path.startsWith("/")) path="/"+path;			
			return `${services.externalGateway}${path}`;
		},
		externalApi:(path)=>{
			if(!path.startsWith("/")) path="/"+path;			
			return `${services.externalGateway}/2020-09${path}`;
		},
		async slack(channel, message){
			const auth={ authorization: `Bearer ${slackToken}` };
			const url = 'https://slack.com/api/chat.postMessage';

			await requestify.post(url,{
				channel: channel,
				text: message
			},{headers: auth,insecure: true,timeout:3000});	
		},
		addSwagger(swagger,dir){
			var servicesRoot=process.cwd()+"/services/2020-09"
			var serviceName = path.relative(servicesRoot,dir);
			this.get(`/api/add?swagger=${swagger}&service=/${serviceName}`)
		},
		toJSON(obj,type){
			if(obj.forEach)
				return obj.map(item=>this.toJSON(item,type))
			else
				if(obj.toJSON)
					return obj.toJSON(type)
				else
					return obj;
		}

	}


module.exports=services;
