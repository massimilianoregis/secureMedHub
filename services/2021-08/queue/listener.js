const {Services,Document} =require("service-libs");


class WebHook extends Document{
    constructor(url,jwt){
        super();
        this.url=url;
        this.jwt= jwt;
    }
    get jwt()   {return this.services.jwt}
    set jwt(value){
        this.services= new Services({jwt:value})
    }
    
    async notify(item){
        this.services.post(this.url,item.toJSON())
    }
    toJSONDB(){
        return {
            url:this.url,       
            jwt:this.jwt
        }
    }
}

module.exports.WebHook=WebHook