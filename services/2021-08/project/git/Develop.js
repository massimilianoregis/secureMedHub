const Issue = require("./Issue");
const Tag = require("./Tag");

class Develop extends Tag{
    constructor(repo,data){
        super(repo,data);
        this.name='develop'
    }
    async getIssuesNotInProd(){
        var {from} = await this.repo.getBeta();
        return (await this.getIssues(from)).filter(item=>item.constructor.name=="Issue")
    }    
    async toJSON(){
        return {
            issuesNotInProd:(await this.getIssuesNotInProd()).map(item=>item.toJSON()),            
        }
    }
}

module.exports=Develop;