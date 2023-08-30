class Workflow{
    execute(request,response){}

    static verbs(value){
        var {groups} = value.match("(?<verb>GET|POST|PUT|DELETE)?\\s?(?<url>.*)")
        var {verb="USE",url} = groups; 
        return {verb:verb.toLowerCase(),url:url}
    }

    addToExpress(app,sender,url,config){
        var {verb,url} = Workflow.verbs(url);

        console.log("\t\tNotifier".green,"add".green,verb,`'${url}'`)
        app[verb](url,async (req,res,next)=>{     
            console.log("\t\tNotifier".green,"call".green,verb,url)       
            var json=res.json;          

            try{req.before= await this.before(req,config,sender)}catch(e){}
            
            res.json=async (response)=>{
                var user = await Workflow.services.user({id:req.user.id||req.body.email})
                if(user) req.user=user;

                var request= Object.assign(
                    req.params,
                    req.body,
                    req.query,
                    req.before,
                    {user:req.user})
                request[req.method.toLowerCase()] = true
                if(this.data){
                    let data = {...this.data}
                    let keys = Object.keys(data)
                    let services = Workflow.services
                    await Promise.all(keys.map(async (key) => {
                        try{
                            data[key] = await eval(data[key])
                        } catch(e){
                            console.log("=========================")                                                        
                            console.log(data[key],e)
                            console.log("=========================")
                        }
                    }))
                    request.data = data
                }
                this.execute(request,response,config,sender,req)
                json(response);
            }            
            next();
        })
    }
}

module.exports=Workflow;