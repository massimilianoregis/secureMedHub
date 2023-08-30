var {Document} =require("service-libs");

class Patient extends Document{
    async load(){        
        if(!this.id)return

        this.vitalSigns= (await Patient.services.vitalSigns({id:this.id}))[0];        
        this.prescriptions= (await Patient.services.prescription({id:this.id}))[0];    
        
        (await Patient.services.bloodwork({id:this.id}))
            .forEach(work=>{this.blood={...this.blood||{}, ...work.data };})
                

    }
    toJSONDB(){
        return {
            id:this.id,
            patientId:this.patientId
        }
    }
    toJSON(){
        return {
            id:this.id,
            patientId:this.patientId,
            vitalSigns:this.vitalSigns,
            prescription:this.prescriptions,
            blood:this.blood
        }
    }
}
module.exports=Patient