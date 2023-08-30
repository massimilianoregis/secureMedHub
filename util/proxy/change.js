const zlib = require('zlib');
var transformerProxy= require("transformer-proxy");
var cheerio = require("cheerio");

module.exports = (filter,type)=>{
	return  transformerProxy(async (text, req, res)=>{		
		try{						
			  if(res.statusCode!=200) return text;			
			
			  if(res.get("content-type") && !res.get("content-type").match(type||"text/html")) return text;
			  if(res.get('content-encoding')=="gzip")	text = zlib.gunzipSync(text).toString()			  	
			  else	text=text.toString();

			  	var data = {
			  		text:text,
			  		replace:function (from,to){
					  	this.text=this.text.replace(new RegExp(from,"g"),to);
					  	return this;	  	
					  },
					html:function(){
						return cheerio.load(this.text)
					}
			  	}  
		
				var result = await filter(data,req,res);
				if(result)	result=result.text||result;
		
				text = result||data.text;


			  if(res.get('content-encoding')=="gzip")			  	
			  	return zlib.gzipSync(text);			  
			  return text;
		  }catch(e){console.log(e)
		  	return text;
		  }
	});
}


