var {Document} =require("service-libs");

class Visit extends Document{
    static get DBRoot() {
		return __dirname
	}
    async load(){
        this.assessment=await Visit.services.assessment({visitId:this.id})
        var procedures=await Visit.services.procedures({visitId:this.id})
        this.assessment.forEach(assess=>{            
            var proc =procedures.find(proc=>proc.assessment==assess.id)
            
            proc&&assess.procedures.push(proc)
            
        })
    }
    toJSON(){
        return {
            id:this.id,
            type:this.type,
            eventDate:this.eventDate,
            patientId:this.patientId,
            physician:this.physician,
            location:this.location,
            reason:this.reason,
            notes:this.notes,
            vitalSigns:this.vitalSigns,
            diagnosis:this.diagnosis,
            prescriptions:this.prescriptions,
            followUp:this.followUp,
            assessment:this.assessment            
        }
    }
}
module.exports=Visit