class Url{
    constructor(value){
        var {verb,url} = value.match("(?<verb>GET|POST|PUT|DELETE|ALL)?\\s?(?<url>.*)").groups

        if(verb=="ALL") verb=".*"
        this.verb=verb;        
        this.url=url;
    }

    canAccess(req){                
        console.log("URL:",this.verb,this.url)
        if(!req.method.match(this.verb)) return;
        if(!req.originalUrl.match(this.url)) return;
        return true;
    }
}
module.exports=Url