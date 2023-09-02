var cookieParser = require('cookie-parser');
var User=require("./User")
var BlackList =require("./BlackList")
const acl = require('express-acl');
var jwtdecoder = require('jsonwebtoken');
const Role = require('./checks/Role')

var roles;
module.exports= (app,config)=>{  
    var {excludeJwt,roles} = config;
    
    roles=config.roles.map(({name,items})=>new Role(name,items,config.roles))
    app.use(cookieParser())	     
    
    //create user in the request
    app.use((req,res,next)=>{        
        jwt = req.get("auth")||req.cookies.auth;                                                            
        try{
            req.user= new User(jwtdecoder.verify(jwt,config.secret), roles)         
        }catch(e){
            req.user = new User({}, roles)
        }
        req.user.jwt=jwt;  
        next();             
    })

    //check for blacklist
    app.use(async (req,res,next)=>{
        if(!jwt || req.user.jwt==excludeJwt) return next()
        
        try{      
        var black= await BlackList.get({userId:req.user.id})        
        if(black){
            console.log("blacklist!!",req.user.id,req.user.email)        
            var jwtReleased=new Date(req.user.iat*1000);
            var blackCreation = new Date(black.createdAt);
            if(jwtReleased<blackCreation){
                req.user.roles=["unknown"]                
            }            
            }
        }catch(e){
            console.log(e)
        }        
        next()
    })	

    //check roles
    app.use(async (req,res,next)=>{               
        if(req.user.canAccess(req))
            return next()

        res.send(403,{msg:'unauthorized'})
    })
  }