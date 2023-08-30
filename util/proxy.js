var HttpProxy = require('http-proxy');
var url = require("url")
const proxy = new HttpProxy();


var bodyParser = require('body-parser');

var _config={};
module.exports=(to)=>
	(req,res,next)=>{
		if(!to.startsWith("http")){
			req.url=eval("`"+to+"`");
			req.app.handle(req,res,next);
			return;
		}
		req.headers['If-None-Match']= null;		
		proxy.web(req,res,{
			target:eval("`"+to+"`"),
			//changeOrigin: true,   
			secure: false,
			//followRedirects:true,
			autoRewrite:true, 			  			
			//hostRewrite:true
		})
	};



proxy.on('proxyReq', (proxyReq, req, res, options) =>{
	if(proxyReq.getHeader('If-None-Match'))
		proxyReq.setHeader('If-None-Match', null);
})

proxy.on('error', function (err, req, res) {
	res.writeHead(500, {
		'Content-Type': 'text/plain'
	});
	 
	res.end('Something went wrong. And we are reporting a custom error message.');
	
})