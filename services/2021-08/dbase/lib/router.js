class Request{
    constructor(event){
        this.method= event.httpMethod;
        this.query = event.queryStringParameters;
        this.params = event.pathParameters;
    }
    
}

class Endpoint{
    path;
    action;
    method;
    constructor(method,path,action){
        this.method=method.toUpperCase();
        this.path=[path].flat();
        this.action=action;
    }
    compatible(event){
        return this.path.find(path =>event.path.match(path) && event.httpMethod==this.method);
    }
    async  execute(event){
        return new Promise((ok,ko)=>{
            var req = new Request(event);
            var res = {
                json:json=>{
                    ok(json);
                }
            }
            
            this.action(req,res)
        })
    }
}

class Router{
    endpoints=[]
    get(path,action){
        path=[path].flat().map(path=>path.replace(/:(.*?)\//gi,"(.*?)/"));
        this.endpoints.push(new Endpoint("get",path,action));
    }
 
    async execute(event){       
        var endpoint = this.endpoints.find(item=>item.compatible(event))
        return await endpoint.execute(event);   
    }
}

module.exports= new Router();