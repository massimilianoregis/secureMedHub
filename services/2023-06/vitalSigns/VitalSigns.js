var {Document} =require("service-libs");

class VitalSigns extends Document{

    toJSON(){
        return {
            id:this.id,
            eventDate:this.eventDate,
            patientId:this.patientId,
            bloodPressure: {
                systolic: this.bloodPressure.systolic,
                diastolic: this.bloodPressure.diastolic
            },
            heartRate: this.heartRate,
            respiratoryRate: this.respiratoryRate,
            bodyTemperature: this.bodyTemperature,
            oxygenSaturation: this.oxygenSaturation
        }
    }
}
module.exports=VitalSigns