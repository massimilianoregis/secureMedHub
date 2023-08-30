var {Document} =require("service-libs");

class NotificationConfiguration extends Document {
    
    toJSONDB(){
        return {
            id: this.id,
            email: this.email,
            alternate_email: this.alternate_email
        }
    }
    toJSON(){
        return {
            id: this.id,
            email: this.email,
            alternate_email: this.alternate_email
        }
    }
}
module.exports=NotificationConfiguration;