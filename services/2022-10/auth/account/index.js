var TemporaryCode = require("./TemporaryCode");
var Authentication= require("./Authentication");
var Cookies= require("./Cookies");
var {v4:uuid} 		= require("uuid");
const {Service} = require("service-libs");
const User = require("./UserSource");
const crypt = require("./crypt");
const fs = require("fs");
const path = require("path");

var auth=new Authentication()
var app = new Service()
	.addInfo()
	.addDefaultConfig(config=>{				
		auth.user = new User(config.jwt.secret,config.jwt.exp)		

		auth.user.services=app.services;  
	})
	.addHateoas()
	.app;	
	app.use(Cookies)
	app.get("/jwt/:email",async (req,res,next)=>{
		console.log("/jwt/:email",req.params.email)
		var user = await auth.user.getByMail(req.params.email);
		res.json(user);
	})

	/**
	 * GET /2022-10/me
	 * @summary current user logged	 
	 * @return {User} 200 - success response
	 * @tags auth
	 */
	app.get("/me",(req,res,next)=>{
		if(req.user.id){
			req.addLink(req.user,"changePassword","changePassword?password=")
			req.addLink(req.user,"logout","logout")
		}
		else{
			req.addLink(req.user,"resetPassword","resetPassword?email=")
			req.addLink(req.user,"lologingout","login?email=&password=")			
		}
		res.json(req.user);
	})
	
	app.get("/temporaryCode/:id",async (req,res)=>{
		var data = await TemporaryCode.get({id:req.params.id})
		req.addLink(data,"changePassword",`changePassword?code=${data.code}&password=`)
		res.json(data);
	})

	/**
	 * POST /2022-10/register
	 * @summary register a new user
	 * @param {RegisterInput} request.body.required - Register input
	 * @return {RegisterOutput} 200 - success response
	 * @tags auth
	 */
	/**
	 * A Register input
	 * @typedef {object} RegisterInput
	 * @property {string} email - email
	 * @property {string} password -  password
	 * @property {string} password_confirmation - password_confirmation
	*/
	/**
	 * A Register output
	 * @typedef {object} RegisterOutput
	 * @property {string} msg - msg	 
	*/
	app.post("/register",async (req,res,next)=>{			
		var data = Object.assign(req.body,req.query);		
		try{
			data = await auth.register(data);
			res.setJWT(data.jwt);	
			console.log('register')
			res.json({msg:"mail sent"})
		}catch(e){
			console.error(e)
			res.status(500).send(e);
		}		
	});
	
	/**
	 * POST /2022-10/confirm
	 * @summary mail confirmation
	 * @param {ConfirmInput} request.body.required
	 * @return {User} 200 - success response
	 * @tags auth
	 */
	/**
	 * A Confirm input
	 * @typedef {object} ConfirmInput
	 * @property {string} code - code	 
	 * @property {string} mail - mail
	*/
	app.post("/confirm",async (req,res,next)=>{		
		try{
			var data = Object.assign(req.body,req.query);
			var user = await auth.confirm(data.code,data.mail);
			res.json(user);
		}catch(e){
			res.status(500).send({msg:e});
		}
	})

	app.get("/login/:fake",(req,res,next)=>{
		

		var user = require(`./fake/${req.params.fake}.json`)
			
		auth.user.addJwt(user)
		res.setJWT(user.jwt)		
		res.json(user)
	})

	/**
	 * GET /2022-10/login
	 * @summary user login	 
	 * @param {LoginInput} request.body.required 
	 * @return {User} 200 - success response
	 * @tags auth
	 */
	/**
	 * A login input
	 * @typedef {object} LoginInput
	 * @property {string} email - email	 
	 * @property {string} password - password
	*/
	app.all("/login",async (req,res,next)=>{		
		var data = Object.assign(req.query,req.body,req.params);		
	
		if(!data.email|| !data.password)  return res.status(401).send({message: 'unauthorize'});		
		var user = await auth.login(data.email.trim().toLowerCase(),data.password);
		
		if(!user) {
			var msg = {message: 'unauthorize'};		
				req.addLink(msg,"resetPassword",`resetPassword?email=${data.email.trim().toLowerCase()}`)
			return res.status(401).send(msg);		
		}
		//if(!user.confirmed) return res.status(401).send({message: 'unauthorize'});		
		res.setJWT(user.jwt);
		req.addLink(user,'logout',"logout")
		res.json(user)		
	});

	/**
	 * GET /2022-10/logout
	 * @summary user logout
	 * @return 200 - success response
	 * @tags auth
	 */
	app.get("/logout",async (req,res,next)=>{			
		if(req.user.personificationBy){			
			var user = await auth.find(req.user.personificationBy)			
			res.setJWT(user.jwt);			
		}
		else{
			res.setJWT(null);
		}
		res.json({});	
	})


	app.all("/socialLogged",async (req,res,next)=>{			
		var data = req.body;	
		
		data.confirmed=true;
		var user = await auth.find(data.email)					
		if(!user) {
			data.password=Math.random().toString(36).slice(2, 8)+Math.random().toString(36).slice(8, 10).toUpperCase()
			data.password_confirmation = data.password
			user =  await auth.register(data);
		}
		
		auth.addLogin(user.email,data.method)

		res.setJWT(user.jwt)
		res.json(user);
	});


	/**
	 * POST /2022-10/resetPassword
	 * @summary current user logged	 
	 * @return {User} 200 - success response
	 * @tags auth
	 */
	app.all(["/sendResetMail","/resetPassword"],async (req,res,next)=>{
		var item = Object.assign(req.query,req.body);		
		try{
			var data = await auth.resetPassword(item.email||item.mail)			
			data.code="****"

			var user = await auth.find(item.email||item.mail)
			data.first_name=user.first_name;
			data.last_name=user.last_name;
			
			data.secret_code = req.hateoas(`/2022-10/auth/temporaryCode/${data.id}`);			
			res.json(data)
		}catch(e){
			return res.status(500).send({error:["mail not found"]});
		}
	});

	/**
	 * POST /2022-10/changePassword
	 * @summary current user change password
	 * @return {User} 200 - success response
	 * @tags auth
	 */
	app.post("/changePassword",async (req,res,next)=>{
		try{
			var item = Object.assign(req.body,req.query)	
			const {password,password_repeat,currentPassword} = item;
			if(password_repeat!= password) throw "passwords don't match";

			if(!item.temporaryCode && req.user){
				if(!await auth.login(req.user.email,currentPassword))
					throw "invalid password";
			}	
			res.json(await auth.changePassword(item.temporaryCode||req.user.email,item.password));			
		}catch(e){
			console.log(e)
			return res.status(500).send({errors:[e]});
		}

	});

	app.post("/",async (req,res,next)=>{
		try{
			var item = req.body;					
			item= await auth.save(item);

			res.json(item)		
		}catch(e){
			res.status(500).send(e);
		}	
	});

	/**
	 * POST /personification
	 * @summary current user change password
	 * @return {User} 200 - success response
	 * @tags auth
	 */
	app.all("/personification",async (req,res,next)=>{			
		var data= Object.assign(req.body,req.query);				
		try{
			user = await auth.personificate(data.email||data.id,req.user.email);										
			
			res.setJWT(user.jwt)

			res.json(user)
		}catch(e){
			console.error(e)
			res.status(500).send(e);
		}	

	})

	
module.exports=app;
