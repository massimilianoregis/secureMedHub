var path = require("path")
var fs = require("fs");
const zlib = require('zlib');
var transformerProxy= require("transformer-proxy")

var app = require("express")();

app.use((req,res,next)=>{
	var file = toFileSystem(req.originalUrl);
	if (fs.existsSync(file)) return res.sendFile(file);

	next();	
})
app.use(
	transformerProxy(function (text, req, res) {
	  if(res.statusCode!=200) return text;
	  
	  if(res.get('content-encoding')=="gzip")
	  	var text = zlib.gunzipSync(text).toString()

	  var file = toFileSystem(req.originalUrl);
	  writeFile(file,text)

	  if(res.get('content-encoding')=="gzip")
	  	return zlib.gzipSync(text);
	  return text;
	})
);

function writeFile(file,data){
	fs.mkdirSync(path.dirname(file),{recursive:true})
	fs.writeFileSync(file,data)
}
function toFileSystem(url){
	var ext = path.extname(url);
	if(ext=="")
		return path.resolve(__dirname,"../_static","."+url,"index.html");
	else
		return path.resolve(__dirname,"../_static","."+url);
}

module.exports = (type)=>app