
const fetch =  require("node-fetch");
const cheerio = require("cheerio")
async function load(url){
	try{
		console.log(url)
		var response = await fetch(url)
		var html = await response.text();

		return {
			load:function(){
				if(!this.$)
				this.$=cheerio.load(html);
			},
			find:function(value){
				this.load();
				return this.$(value);
				},
			text:function(){				
				return html;
			},
			html:function(){
				this.load();
				return this.$.html();
			}
		};
	}catch(e){console.log(e)}
}

module.exports=load
