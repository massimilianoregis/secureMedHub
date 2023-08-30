
class Issue{
    static  loadFromData(repo,data){
        if(data.pull_request) 
            return  require('./PR').loadFromData(repo,data)
        return new Issue(repo,`${data.number}`).setData(data);
    }
    static async load(repo,id){
        var issue =await new Issue(repo,id).load()
        if(issue.data.pull_request) 
            return await require('./PR').load(repo,id)
        
        return issue;
    }
    constructor(repo,id){        
        this.repo=repo;
        this.id=id;
    }
    
    get url(){
        if(!this.data) throw "call async load() before";
        if(!this.data.url) return null;
        return this.data.url
    }
    async assignedTo(){
        if(!this.data) throw "call async load() before";
        if(!this.data.assignees) return null;
        return this.data.assignees.map(item=>item.login)
    }
    get created(){
        if(!this.data) throw "call async load() before";
        if(!this.data.created_at) return null;
        return new Date(this.data.created_at)
    }
    get closed(){
        if(!this.data) throw "call async load() before";
        if(!this.data.closed_at) return null;
        return new Date(this.data.closed_at)
    }
    async status(){
        if(this.repo.production) 
            if(this.closed>this.repo.production.from && this.closed<this.repo.production.to)
                return "production"
        if(this.repo.beta) 
            if(this.closed>this.repo.beta.from && this.closed<this.repo.beta.to)
                return "beta"
        if(this.repo.develop) 
            if(this.closed>this.repo.develop.from)
                return "develop"
        if(this.closed)
            return "closed"
        return "open"
    }
    async load(){
        var {data} =await this.repo.git.call.request('GET /repos/{owner}/{repo}/issues/{issue}',{
            owner:this.repo.owner,
            repo:this.repo.name,
            issue:this.id
        })
        this.setData(data);
        
        return this;
    }
    setData(data){
        this.data=data;
        this.created_at=data.created_at
        this.title=data.title;
        this.labels=data.labels.map(label=>label.name);
        
        return this;
    }   

    
    async addLabel(label){
        await this.load();
        this.labels.push(label);
        await this.repo.git.call.request('PATCH /repos/{owner}/{repo}/issues/{issue}',{
            owner:this.repo.owner,
            repo:this.repo.name,
            issue:this.id,
            labels:this.labels
        })
    }

    async getComments(){
        var {data}=await this.repo.git.call.request('GET /repos/{owner}/{repo}/issues/{issue}/comments',{
            owner:this.repo.owner,
            repo:this.repo.name,
            issue:this.id
        })
        return data.map(comment=>({
            text:comment.body,
            user:comment.user.login,
            created_at:commment.created_at
            })
        )
    }
    async toString(){
        var status =await this.status()
        return `I  ${this.id} ${status}`;
    }

    toJSON(){
       // return this;
        return {
            title:this.data.title,
            assignedTo: this.data.assignee?.login,
            url:this.data.url,
            closed_at: this.data.closed_at
        }
    }
}
module.exports=Issue