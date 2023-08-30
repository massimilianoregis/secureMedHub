module.exports=function(req,res,next){
	res.setHeader('Access-Control-Allow-Origin', req.get('origin')||"*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-type, auth');
    res.setHeader('Access-Control-Allow-Credentials', true);
    if(req.method!=="OPTIONS") return next();
    res.end();
	}