const Feature = require("../Feature");

class RegularMail extends Feature{
    async send(user,data,config){
        if (!config.length){
            console.log("REGULAR MAIL")
            await RegularMail.services.klaviyo({template: data.template, to: data.to, context: data.context, ...data})
        }
    }
}

module.exports=RegularMail