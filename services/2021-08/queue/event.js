var {Document} =require("service-libs");


class QueueEvent extends Document{
    static configDB(db){
        db.ensureIndex({ fieldName: 'name', unique: true });
    }
/*
    toJSON(){
        return{
            id:this.id,
            name:this.name,
            priority : this.priority,
            unique  : this.unique,
            scheduled:this.scheduled,
            destroy: this.destroy,
            call:this.call,
            method:this.method,
            data:this.data,
            creation_time:this.creation_time,
            execution:this.execution,
            error:this.error,
        }
    }
    toJSONDB(){
        return{
            id:this.id,
            name:this.name?this.name:this.id,
            priority : this.priority,
            unique  : this.unique,
            scheduled:this.scheduled,
            destroy: this.destroy,
            call:this.call,
            method:this.method,
            data:this.data,
            execution:this.execution,
            error:this.error,
        }
    }*/
}

module.exports=QueueEvent;