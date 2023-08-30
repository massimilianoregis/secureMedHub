try{
var {Service} = require("service-libs");
const Notifier = require("./Notifier");
const NotificationConfiguration = require("./userConfiguration/NotificationConfiguration")
var app=new Service(app)
    .addDefaultConfig((config,gateway)=>{
		gateway.use(Notifier.new(config,app.services))
    })
    .app
app.put("/", async (req, res, next) => {
    let {email, alternate_email} = req.body
    let exist = await NotificationConfiguration.get({email: email})
    if (exist) {
        Object.assign(exist, req.body)
        await exist.save()
        res.json(exist)
       
    } else {
        let post = await new NotificationConfiguration({email:email, alternate_email: alternate_email})
        post.save()
        res.json(post)
    }
})
app.addRest(NotificationConfiguration)
    
module.exports=app;
}catch(e){
    console.log(e)
}