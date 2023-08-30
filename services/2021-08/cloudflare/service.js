const requestify= require("requestify")
class CloudFlare{

    constructor(auth){
        this.auth=auth;
    }
    
    async dns(subdomain,ip){
        if(subdomain.split(".").length<2) return;
        
        console.log("CLOUDFLARE","DNS",subdomain,ip)
        const zones = await this.zones(); 
        var zone = zones.result.find(zone=>subdomain.match(zone.name))
        var dnss = await this.dnsList(zone.id);
        var dns = dnss.result.find(dns=>dns.name==subdomain)
        var result;
        if(dns)
            result=await this.put(`zones/${zone.id}/dns_records/${dns.id}`,{type: dns.type,name:dns.name,ttl:dns.ttl,content:ip})
        else
            result=await this.post(`zones/${zone.id}/dns_records`,{type: "A",name:subdomain,ttl:1,content:ip})
        
        return result;
    }
    async dnsList(zone){
        return await this.get(`zones/${zone}/dns_records`);
    }
    async zones(){        
        return await this.get(`zones`);        
    }

    async get(url,params,body){
        console.log(url)
        const headers = {"Authorization":`Bearer ${this.auth}`}
        var options ={headers:headers,params:params,timeout:10000}
        return (await requestify.get(`https://api.cloudflare.com/client/v4/${url}`,options)).getBody()
    }
    async put(url,body){
        console.log(url)
        const headers = {"Authorization":`Bearer ${this.auth}`}
        var options ={headers:headers,timeout:10000}
        return (await requestify.put(`https://api.cloudflare.com/client/v4/${url}`,body,options)).getBody()
    }
    async post(url,body){
        console.log(url)
        const headers = {"Authorization":`Bearer ${this.auth}`}
        var options ={headers:headers,timeout:10000}
        return (await requestify.post(`https://api.cloudflare.com/client/v4/${url}`,body,options)).getBody()
    }
}
module.exports=CloudFlare