module.exports=(text,act)=>{
	return (req,res,next)=>{
		var referer= req.get("Referer");	
		if(referer && referer.match(text))
			return act(req,res,next)
		
		next();
		}
}