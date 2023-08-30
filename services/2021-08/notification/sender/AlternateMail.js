const Feature = require("../Feature");

class AlternateMail extends Feature{
    async send(user,data,config){
        if (config.length){
            if (config[0].alternate_email) {
                console.log("ALTERNATE MAIL")
                let body = {...data}
                body.to = config[0].alternate_email
                await AlternateMail.services.klaviyo(body)
            }
        }
    }
}


module.exports=AlternateMail