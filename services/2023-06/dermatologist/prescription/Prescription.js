var {Document} =require("service-libs");

class Prescription extends Document{
    static get DBRoot() {
		return __dirname
	}
    toJSON(){
        return {
            id:this.id,
            eventDate:this.eventDate,
            patientId:this.patientId,
            physician:this.physician,
            location:this.location,
            name:this.name,            
            qta:this.qta,
            frequency: this.frequency,
            notes:this.notes
        }
    }
}
module.exports=Prescription