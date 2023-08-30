try{
var {Service} =require("service-libs");
const User = require("./service");

/*
* this object is an abstract class created in order to have some commons functions
* is not needed to use this class in order to expose the service. 
*/
let url
var app=new Service()
    .addDefaultConfig(config=>{
		// here you are able to read the configuration that is present in /config.js
		url = config.url
    })        
    //this method will add GET/POST/PUT/DELETE actions and a lot of standard queries
    //.addRest(User)
    .addJsDoc(__dirname)
    .app

/**
 * GET /2021-08/user/me
 * @summary list of dbase
 * @return {UserMe} 200 - success response
 * @tags User
 */
 app.get("/me",async (req,res,next)=>{
    var gateway=`${req.protocol}://${req.get("host")}`
    if(!req.user.email) return res.json({})

    var user = await User.get({id:req.user.id}); 
    await user.newAccess(req.user.id)
    return res.json(await require("./userMe").create(user,gateway))                           
})
/**
 * GET /2021-08/user/mail/{mail}
 * @summary list of dbase
 * @param {string} country.path.required - name param description
 * @return {object} 200 - success response
 * @tags User
 */
app.get("/mail/:mail",async (req,res,next)=>{        
    const user =await User.get({email:req.params.mail})
    res.json(user)
})


/**
 * POST /2021-08/user/
 * @summary a way to create user on fly with just email
 * @param {email}
 * @return  200 { success: "email sent" } - success response
 * @tags VetPortal
 * @security BearerAuth
 */
 app.post("/", async (req, res, next) => {

    if(!req.body.password || !req.body.email) {
        
        try {
            if(!req.body.email) {
                req.body.email = req.body.first_name+req.body.last_name+"-"+new Date().getTime()+"@fakebps.com"
            }

            req.body.password = Math.random()
            .toString(36)
            .slice(2, 10);
            req.body.passwordChange = true
			next()
			
			const email = req.body.email
			const psw = req.body.password
			url = eval('`'+url+'`')
			
			let host = req.get("host");
            let sendEmail = true
            if(req.body.sendMail === false) {
                sendEmail = false
            }
			if(req.body.template && req.body.email && sendEmail) {
                await app.call.userOnFly({
                    email: req.body.email,
                    template: req.body.template,
                    context: {
                        confirmationLink: host + url
                    }
				})
				res.json({ success: "email sent" });
            }
        } catch (error) {
            console.error(error);
        }
    } else {
        next()
    }
});

app.addRest(User)

/**
 * PUT /2021-08/user/:id/preferences
 * @summary a way to add or modify preferences
 * @param {preferences}
 * @return  200 { success: "preferences modified" } - success response
 * @tags VetPortal
 * @security BearerAuth
 */
app.put("/:id/preferences", async (req, res, next) => {
    
    const preferences = req.body.preferences
    
    if (req.obj.preferences) {
        Object.assign(req.obj.preferences,preferences)
    }
    else {
        req.obj.preferences = preferences
    }
    
    
    req.obj.save()
    res.json(req.obj)
})

module.exports=app;
}catch(e){
    console.log(e)
}