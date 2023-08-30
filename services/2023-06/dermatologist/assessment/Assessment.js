var {Document} =require("service-libs");
const path =require('path')
class Assessment extends Document{
    static get DBRoot() {
		return path.resolve(__dirname,'../')
	}
    toJSON(){
        return {
            id:this.id,
            visit:this.visit,
            eventDate:this.eventDate,
            patientId:this.patientId,
            physician:this.physician,
            location:this.location,
            name:this.name,
            where:this.where,
            expectations:this.expectations,
            contact_office_if:this.contact_office_if,
            procedures:this.procedures||[],
            note:this.notes||this.note
        }
    }
}
module.exports=Assessment