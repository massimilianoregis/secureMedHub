var {Document} =require("service-libs");

class BloodWork extends Document{

    toJSON(){
        return {
            id:this.id,
            eventDate:this.eventDate,
            patientId:this.patientId,
            data:this.data
        }
    }
}
module.exports=BloodWork