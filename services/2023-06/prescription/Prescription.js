var {Document} =require("service-libs");

class Prescription extends Document{

    toJSON(){
        return {
            id:this.id,
            eventDate:this.eventDate,
            patientId:this.patientId,
            medication: this.medication,
            strength: this.strength,
            dosageInstructions: this.dosageInstructions,
            quantity: this.quantity,            
        }
    }
}
module.exports=Prescription