var cookieParser = require('cookie-parser');
var User=require("./User")
var BlackList =require("./BlackList")
const acl = require('express-acl');
var jwtdecoder = require('jsonwebtoken');

acl.config({
    //baseUrl: '2020-09',
    //path: 'db',
    filename: 'nacl.json',
    defaultRole: 'unknown',
    roleSearchPath: 'user.role',
    denyCallback: (res) => {
        throw {
            code:403,
            message: 'You are not authorized to access this resource'
        }
      
    }
  });

module.exports= (app,config)=>{  
    var {excludeJwt} = config;
    app.use(cookieParser())	        
    app.use((req,res,next)=>{          
        jwt = req.get("auth")||req.cookies.auth;                                            
        req.user={role:"unknown", canAccess(){return false;}};
        try{
            req.user= new User(jwtdecoder.verify(jwt,config.secret))         
        }catch(e){
            console.log(e);
            req.user = new User({})
        }
        req.user.jwt=jwt;  
        next();             
    })
    app.use(async (req,res,next)=>{
        if(!jwt || req.user.jwt==excludeJwt) return next()
        
        try{      
        var black= await BlackList.get({userId:req.user.id})        
        if(black){
            console.log("blacklist!!",req.user.id,req.user.email)        
            var jwtReleased=new Date(req.user.iat*1000);
            var blackCreation = new Date(black.createdAt);
            if(jwtReleased<blackCreation){
                req.user.roles=[{"name": "unknown"}]
                req.user.role="unknown";
            }            
            }
        }catch(e){
            console.log(e)
        }
        next()
    })	
    app.use(acl.authorize);    
  }