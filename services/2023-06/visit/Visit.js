var {Document} =require("service-libs");

class Visit extends Document{

    static get DBRoot() {
		return __dirname
	}
   
    async beforeSave(){
        this.eventDate=new Date();

        if(!this.patientId){
            var {id}= await Visit.services.patient({})
            this.patientId=id;
        }
        if(this.vitalSigns){
            var {id}= await Visit.services.vitalSigns({
                ...this.vitalSigns,
                patientId:this.patientId,
                eventDate:this.eventDate
            })
            this.vitalSigns.id=id;
        }
        for(var i in this.prescriptions||[]){
            var prescription=this.prescriptions[i]
            var {id}= await Visit.services.prescription({
                ...prescription,
                patientId:this.patientId,
                eventDate:this.eventDate
            })
            prescription.id=id;
        }
    }
    toJSON(){
        return {
            id:this.id,
            eventDate:this.eventDate,
            patientId:this.patientId,
            physician:this.physician,
            location:this.location,
            reason:this.reason,
            notes:this.notes,
            vitalSigns:this.vitalSigns,
            diagnosis:this.diagnosis,
            prescriptions:this.prescriptions,
            followUp:this.followUp
        }
    }
}
module.exports=Visit