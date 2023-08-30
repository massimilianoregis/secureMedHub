var cookieParser = require('cookie-parser');
var app = require("express")()	
    app.use(cookieParser())
	app.use((req,res,next)=>{		
		res.setJWT=function(value){
            this.jwt=value;
			var host = req.get('host');
			var subdomain = "."+host.split(":")[0].split(".").slice(-2).join(".");
			
            if(!value){
                if(subdomain!=".localhost") this.clearCookie("auth",{domain:subdomain});
                this.clearCookie("auth",{domain:"localhost"});
            }
            else{
                if(subdomain!=".localhost") this.cookie("auth",value,{ maxAge: 2147483647,domain:subdomain});			
                this.cookie("auth",value,{ maxAge: 2147483647,domain:"localhost"});			
            }                
			
		}
		next();
	})

module.exports=app;
    