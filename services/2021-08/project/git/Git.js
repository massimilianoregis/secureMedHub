const { Octokit } = require("octokit");
const GitListener = require("./GitListener");
const Issue = require("./Issue");
const Repository = require("./Repository");


class Git{
    static config(config){
        var git = new Git(config.key);
        git.repositories=config.repositories.map(repo=>{
            var repo=git.getRepository(repo.split('/')[1],repo.split('/')[0])
                repo.addWebHook(config.webhook,'push','pull_request','issues');
            return repo;
        })
        return git;
    }
    listeners=[]
    constructor(secret){
        this.call=  new Octokit({
            auth: secret
          })
    }
    getRepositories(){
        return this.repositories;
    }
    getRepository(name,owner){
        return new Repository(this,name,owner);
    }

    addListener(listener){
        this.listeners.push(listener);
        return this;
    }
    
    webhook(json){
        //console.log('github','webhook',json)   
        //branch 
        if(json.ref) try{
            var id=json.ref.match('(?<id>[0-9]+)').groups.id
            this.onPush(json.repository.name,json.repository.owner.name,id)
        }catch(e){}
        
        
        //pull request
        var issue;
        console.log(json)
        try{issue=json.pull_request.head.ref.match('(?<id>[0-9]+)').groups.id}catch(e){}

        var repo=json.repository.name;
        var owner =json.repository.owner.login;
        var number=json.number;
        this.onGitChange(repo,owner,number,issue)
        if(json.pull_request&&json.action=='opened'){            
            if(this.draft)
                this.onPRDraft(repo,owner,number,issue)
            else
                this.onPRwaitingForApproval(repo,owner,number,issue)
        }
        if(json.pull_request&&json.action=='ready_for_review')
            this.onPRwaitingForApproval(repo,owner,number,issue)        
        if(json.pull_request&&json.action=='converted_to_draft')
            this.onPRDraft(repo,owner,number,issue)        
        if(json.pull_request&&json.action=='closed')
            this.onMerge(repo,owner,number,issue)        
        
    }
    
    
    onGitChange(project,owner,pr,issue){
        this.listeners.forEach(listener=>listener.onGitChange(project,owner,pr,issue))
    }
    onPRDraft(project,owner,pr,issue){
        this.listeners.forEach(listener=>listener.onPRDraft(project,owner,pr,issue))
    }
    onPRwaitingForApproval(project,owner,pr,issue){
        this.listeners.forEach(listener=>listener.onPRwaitingForApproval(project,owner,pr,issue))
    }
    newIssue(project,owner,url){
        this.listeners.forEach(listener=>listener.newIssue(project,owner,url))
    }
    onPush(project,owner,id){
        this.listeners.forEach(listener=>listener.onPush(project,owner,id))
    }
    onMerge(project,owner,id){
        this.listeners.forEach(listener=>listener.onMerge(project,owner,id))
    }

    async toJSON(){
        var repos=this.getRepositories()
        var result =[]
        for(var i in repos)
            result.push(await (repos[i].toJSON())) 
        return {
            repository:result
        }
    }
}





Git.GitListener=GitListener
module.exports=Git