class Card{
    constructor(trello,id,board,desc){
        this.trello=trello;
        this.id=id;
        this.board=board;
        this.desc=desc;
    }

    static async create(board,title,desc,list,start,due,labels,members){
        if(!list.match('.{24}')) return; 
        var data={
            idList:list,
            start: start,
            name:title,
            desc:desc
        }
        if(due) {data.due=due; data.dueComplete=true; }
        if(labels && labels.length>0) data.idLabels=labels.join(',');
        if(members && members.length>0) data.idMembers=members.join(',')
        
        console.log(`create card`,title,list)
        
        return new Card(await board.trello.post(`/1/cards?${new URLSearchParams(data)}`) )       
    }
    async getBoard(){
        return this.board;
    }
    async load(){
        if(this.data) return this;  
        var data =await this.trello.get(`/1/cards/${this.id}`);
            
        return this.setData(data);        
    }
    setData(data){
        this.data=data;
        this.desc=data.desc;
        this.title=data.name;
        this.idList=data.idList;
        return this;
    }
    async getIssue(desc){
        if(desc==null)
            if(this.desc==null)
                desc = (await this.load()).desc
            else    
                desc=this.desc

        try{
            var issue= desc.match(`https://github.com/(.*)/(.*)/(.*?)/([0-9]+)`)[0];
            return issue.match('https://github.com/(?<owner>.*)/(?<repo>.*)/(?<type>.*?)/(?<id>[0-9]+)').groups
        } catch(e){
            return null;
        }
    }
    async addDescription(descr){
        var card =await this.trello.get(`/1/cards/${this.id}`)
        card.desc+='\r'+descr;
        await this.trello.put(`/1/cards/${this.id}`,{desc:card.desc})
        return card;
    }
    async setTitle(title){    
        console.log('setTitle',title)    
        await this.trello.put(`/1/cards/${this.id}`,{name:title}) 
    }
    async setDescription(desc,oldDesc){
        var issue = await this.getIssue(desc);
        var oldIssue = await this.getIssue(oldDesc);        
        if(issue && !oldIssue) await this.trello.addIssue(this.id,issue.owner,issue.repo,issue.id)
    }
    async moveToDoing(){        
        console.log('moveToDoing',this.board.scrum)
        this.moveTo('doing')        
    }
    async moveToDone(){        
        console.log('moveToDone',this.board.scrum)
        this.moveTo('done')
    }
    
    async moveToQA(){        
        console.log('moveToQA',this.board.scrum)
        this.moveTo('qa')
    }
    async moveToApproved(){        
        console.log('moveToApproved',this.board.scrum)
        this.moveTo('approved')
    }
    async moveToDevelop(){        
        console.log('moveToDevelop',this.board.scrum)
        this.moveTo('develop')
    }
    async moveTo(id){        
        var id =this.board.scrum[id]||id;
        if(!id.match('.{24}')) return;        
        if(this.idList==id) return;
        console.log(`\tcard ${this.idList} => ${id}`)
        await this.trello.put(`/1/cards/${this.id}`,{idList:id})
    }
    async delete(){
        console.log('delete',this.id)
        await this.trello.delete(`/1/cards/${this.id}`)     
    }
    async addIssueOnTitle(){        
        await this.load()
        var issue=await this.getIssue();        
        if(!issue) return;        

        var title =this.title.match(`^#(?<issue>.*?) `) 
        if(!title || title.groups.issue!=issue.id){
            var text =this.title         
            var spl =text.split(' - ');
            if(spl.length>1) text=spl[1];
            
            await this.setTitle(`#${issue.id} - ${text}`)
        }
    }
    
}

module.exports=Card