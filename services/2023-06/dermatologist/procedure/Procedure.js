var {Document} =require("service-libs");
const path =require('path')

class Procedure extends Document{
    static get DBRoot() {
		return path.resolve(__dirname,'..')
	}
    toJSON(){
        return {
            id:this.id,
            eventDate:this.eventDate,
            patientId:this.patientId,
            physician:this.physician,
            location:this.location,
            visitId:this.visitId,
            assessment:this.assessment,
            name:this.name,      
            number:this.number,      
            consent:this.consent,
            post_care_instruction: this.post_care_instruction,
            notes:this.notes
        }
    }
}
module.exports=Procedure