const Feature = require("./Feature");
const NotificationConfiguration = require("./userConfiguration/NotificationConfiguration")

class FeatureChain extends Feature{
    constructor(list){
        super()
        this.list=list;
    }
    async send(user,data){
        var config; 
        config = await NotificationConfiguration.find({email: data.to})
        for(var i in this.list){
            await this.list[i].send(user,data,config)
        }
    }
}
module.exports=FeatureChain