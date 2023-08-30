var moment = require("moment-timezone")
class Tag{
    constructor(repo,data){
        this.repo=repo;
        this.name=data.name;
        this.date=data.date;
        this.issues=data.issues;
        this.from=data.from||new Date('01/01/2000');        
        this.to=data.to; 
    }
    
    async getIssues(from=this.from,to=this.to){       
       var issues=(await this.repo.getIssues('closed',from));          
        if(to) issues= issues.filter(item=>item.closed<=to)        
       return issues;
    }

    async toJSON(){
        return {
            name:this.name,
            from:moment(this.from).format("MM/DD/yyyy HH:mm"),
            to:this.to,
           // issues:await this.getIssues()
        }
    }
}
module.exports=Tag