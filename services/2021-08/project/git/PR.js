const Issue = require("./Issue")

class PR extends Issue{
    static  loadFromData(repo,data){        
        
        return new PR(repo,`${data.number}`).setData(data);
    }
    static async load(repo,id){
      
        return await new PR(repo,id).load();
    }

    constructor(repo,id){
        super(repo,id)
    }
    async status(){                      

        if(this.repo.production) 
            if(this.closed>this.repo.production.from && this.closed<this.repo.production.to)
                return "production"
        if(this.repo.beta) 
            if(this.closed>this.repo.beta.from && this.closed<this.repo.beta.to)
                return "beta"
        if(this.repo.develop) 
            if(this.closed>this.repo.develop.from )
                return "develop"

        if(this.merged) return "closed";
        if(this.closed) return "closed";
        if(this.isDraft) return "doing";
        if(await this.isApproved()) return "approved";
        if(await this.isWaitingForApprove()) return "qa";
        if(!this.isDraft) return "done";

        return "doing"        
    }
    async loadReview(){
        if(this.reviews) return;
        var {data} =await this.repo.git.call.request('GET /repos/{owner}/{repo}/pulls/{issue}/reviews',{
            owner:this.repo.owner,
            repo:this.repo.name,
            issue:this.id
        })
        this.reviews=data;
    }
    async loadReviewer(){
        if(this.reviewer) return;        
        var {data} =await this.repo.git.call.request('GET /repos/{owner}/{repo}/pulls/{issue}/requested_reviewers',{
            owner:this.repo.owner,
            repo:this.repo.name,
            issue:this.id
        })
        this.reviewer=data;
    }

    
    async isWaitingForApprove(){
        await this.loadReviewer();
        return this.reviewer.users.length>0 ||  this.reviewer.teams.length>0     
    }
    async isApproved(){
        await this.loadReview();
        return this.reviews.find(item=>item.state=='APPROVED')        
    }
    get isDraft(){
        if(!this.data) throw "call async load() before"
        if(this.data.draft) return this.data.draft;
        if(!this.data.pull_request) return null;
        if(this.data.pull_request.draft) return this.data.pull_request.pull_request;
    }
    get merged(){
        if(!this.data) throw "call async load() before";
        if(this.data.merged_at) return new Date(this.data.merged_at);
        if(!this.data.pull_request) return null;
        if(this.data.pull_request.merged_at) return new Date(this.data.pull_request.merged_at);
    }

    get isPR(){return true;}
    async load() {         
        var {data} =await this.repo.git.call.request('GET /repos/{owner}/{repo}/pulls/{issue}',{
            owner:this.repo.owner,
            repo:this.repo.name,
            issue:this.id
        })
        this.data=data;
        return this;
    }
    async toString(){
        var status =await this.status()
        return `PR ${this.id} ${status}`;
    }
}
module.exports=PR
