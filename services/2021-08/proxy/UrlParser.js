class UrlParser{
    static parse(value){
        var {groups} = value.match("(?<verb>GET|POST|PUT|DELETE)?\s?(?<url>.*)")        
        var {verb="USE",url} = groups; 
        return {verb:verb.toLowerCase(),url:url.toLowerCase()}
    }
}
module.exports=UrlParser;