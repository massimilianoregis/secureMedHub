try{
const {Service} = require("service-libs")
const requestify = require("requestify")



const app = new Service()
    .addDefaultConfig(config=>{
        slack= new Slack(config.token)
    })
    .addJsDoc(__dirname)
    .app;
    app.get("/conversations",async (req,res,next)=>{
        res.json(await slack.conversationId(req.query.cursor));
    })
  
    app.get("/send",async (req,res,next)=>{
        res.json(await slack.send(req.query.channel,req.query.message));
    })

class Slack{
    constructor(slackToken){
        this.slackToken=slackToken
    }
    async call(method,url,data){
        const auth={ authorization: `Bearer ${this.slackToken}` };

        console.log(this.slackToken,data);
        if(method=="get")
            return (await requestify[method](url,{headers: auth,insecure: true,timeout:3000})).getBody();
        else
		    return await requestify[method](url,data,{headers: auth,insecure: true,timeout:3000});
    }
    async conversationId(cursor)    {
        if(cursor)
            return await this.call("get",`https://slack.com/api/conversations.list?cursor=${cursor}`)
        else
            return await this.call("get",'https://slack.com/api/conversations.list')
    }
    async send(channel, message){        
		return await this.call("post",'https://slack.com/api/chat.postMessage',{
			channel: channel,
			text: message,
			username:"totorobot"
		});		        
	}    
}
var slack;

module.exports=app
}catch(e){console.log(e)}