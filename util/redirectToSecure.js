module.exports = function (req,res,next) {	
	if(req.hostname.startsWith("localhost")) return next();
	if(!req.secure) return res.redirect('https://' + req.hostname + req.url);
	next();
};