var Card =require('./Card')
class Board{
    projectLabels=[]
    typeLabels=[]
    scrum={        
    }
    list=[]
    constructor(trello,short){
        this.trello=trello;
        this.short=short;
    }
    setTodo(name)       {this.scrum.todo=name; return this;}
    setDoing(name)      {this.scrum.doing=name; return this;}
    setDone(name)       {this.scrum.done=name; return this;}
    setApproved(name)   {this.scrum.approved=name; return this;}
    setDevelop(name)    {this.scrum.develop=name; return this;}
    
    setProjectLabel(label,git){
        this.projectLabels.push({name:label,github:git})
        return this;
    }
    setProjectMembers(members){
        this.members=members
    }
    getProjectFromLabel(label){
        return this.projectLabels.find(label=>label.name==label).github        
    }
    getLabelIdFromProject(project){
        return this.projectLabels.find(label=>label.github==project).id        
    }

    setTypeLabel(type,label){
        this.typeLabels.push({name:label,type:type})
        return this;
    }
    getLabelIdFromType(type){
        return this.typeLabels.find(label=>label.type==type).id        
    }

    getTodoId()         {return this.scrum.todo}
    getDoingId()        {return this.scrum.doing}
    getDoneId()         {return this.scrum.done}
    getDevelopId()      {return this.scrum.develop}
    getApprovedId()     {return this.scrum.approved}
    
    async init(){
        var labels=await this.getLabels();
        this.projectLabels.forEach(label=>
            label.id=(labels.find(l=>l.name==label.name)||{}).id
        )  
        this.typeLabels.forEach(label=>
            label.id=(labels.find(l=>l.name==label.name)||{}).id
        )  

        var list=await this.getList();
        for(var i in this.scrum){
            var item =list.find(item=>this.scrum[i]==item.name)
            if(item)    this.scrum[i]=item.id;
        }
    }
    async getCardsFromIssue(owner,name,issue){
        return await this.getCardsFromDescription(`https://github.com/${owner}/${name}/(.*?)/${issue}#`)
    }
    async getCardsFromDescription(desc){        
        var cards=await this.getCards()
        var list =cards.filter(card=>card.desc&&card.desc.match(desc));
                
        return new (require('./Trello').CardList)(list);
    }
    async getLabels(){
        this.labels=(await this.trello.get(`/1/boards/${this.short}/labels`))     
        return this.labels;
    }
    async getList()     {
        if(this.lists) return this.lists;
        this.lists=(await this.trello.get(`/1/boards/${this.short}/lists`)).map(list=>({
            id:list.id,
            name:list.name
        }))        
        return this.lists;
    }
    async getCards(){
        if(this.cards) return this.cards;
        this.cards = (await this.trello.get(`/1/boards/${this.short}/cards`)).map(card=>
            new Card(this.trello,card.shortLink,this,card.desc).setData(card)
            )
        return this.cards;
    }

    async addWebHook(name,url){
        var board=await this.trello.get(`/1/boards/${this.short}`)
        this.id=board.id;
        try{
            console.info('trello','addWebHook',{"description": name,"callbackURL": url,"idModel": board.id})
            var response =await this.trello.post(`/1/tokens/${this.trello.token}/webhooks/`,{
                "description": name,
                "callbackURL": url,
                "idModel": board.id
            })
            console.log('trello','addWebHook','created',response)
        }catch(e){
            console.error('trello','addWebHook',e)
        }
        await this.init();
    }
    async getMember(alias){
        for(var i in this.members){            
            var aliases =this.members[i];
            if(aliases.includes(alias)) 
                return (await this.getMembers()).id;
        }
    }
    async getMembers(list){   
        if(list==null){
            if(this.members) return this.members;   
            this.members=await this.trello.get(`/1/members/${i}`);
            return this.members;  
        }
        return (await Promise.all(list.map(item=>this.getMember(item))))
            .filter(item=>item)
    }
    async addColumn(name){
        try{
            return (await this.getList()).find(list=>list.name==name).id;
        }catch(e){                                                        
            var id =(await this.trello.post(`/1/lists`,{name:name,idBoard:this.id,pos:'bottom'})).id;
            this.lists=null;
            return id;
        }
    }
    async addCardFromIssue(issue,list){        
        if(list=='open') list='backlog' 
        if(list=='closed') return;
        var issueId=issue.id;
        var title =`${issue.title}`;
        var description =issue.data.html_url;
        var list=this.scrum[list]||list;
        var project =`${issue.repo.owner}/${issue.repo.name}`;
        var type =issue.constructor.name=='PR'?'pr':'issue'
        var members = await this.getMembers(await issue.assignedTo());
        
        
        var labels =[this.getLabelIdFromProject(project),this.getLabelIdFromType(type)];            
        labels=labels.filter(label=>label)
        
        
        var title=`#${issueId} - ${title}`
        var desc=`${description}#`;
        var card =await Card.create(this,title,desc,list, issue.created,issue.closed,labels,members)
        if(card) this.cards.push(card);
    }

}
module.exports=Board