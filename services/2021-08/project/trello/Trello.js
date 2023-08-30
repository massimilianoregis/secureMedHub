const Board = require('./Board');
const Card = require('./Card');
const TrelloListener = require('./TrelloListener');

class Trello{
    /*
    {
        key:'',
        token:'',
        boards:[{
            short:'',
            projectLabels:{
                backend:'service-gateway',
                accounts:'ui-accountApp'
                },
             members:{
                    'massimilianoregis':['massimilianoregis1']
                  },
            scrum:{
                todo:'To-do',
                doing:'In Progress',
                done:'On Hold',
                approved:'QA',
                develop:'Done'
            },
            webhook:`${domain}/trello/webhook`
        }]
    }
    */
    static config(config){
        var trello=new Trello(config.key,config.token);
        config.boards.forEach(board=>{
            var brd=trello.addBoard(board.short);
            for(var i in board.projectLabels)
                brd.setProjectLabel(i,board.projectLabels[i])
            for(var i in board.typeLabels)
                brd.setTypeLabel(i,board.typeLabels[i])
            if(board.members)
                brd.setProjectMembers(board.members)
            brd.scrum=board.scrum;
            brd.addWebHook('project',board.webhook);
        })
        return trello;
    }
    constructor(key,token){
        this.key=key;
        this.token=token;
        this.axios = require('axios').create({
            params:{key:key,token:token}
        });
    }
    projectLabels={}
    listeners=[]
    boards=[]

   
    webhook(json){
        //console.info('trello','webhook',json)
        if(!json.action) return;
        var data =  json.action.data;
        var action = json.action.type;

        //if(action=='createCard')            trello.newCard(data.card.name,data.list.name)
        if(action=='deleteCard')            console.log('card','delete',data.card)
        if(action=='updateCard' && data.card.desc)     this.changeCardDescription(data.card.id,data.card.desc,data.old.desc)       //console.log('card','update',data.card,data.old)
        if(action=='addLabelToCard')        this.addLabelToCard(data.card.id,data.card.name,data.label.name,json.model.id);
        if(action=='removeLabelFromCard')   console.log('label','delete',data.label.name)
        if(action=='commentCard')           console.log('card','comment',data.text)
    }

    //CALLS
    async delete(url,body){
        try{
            console.log('trello','delete',url)
            url='https://api.trello.com'+url;
            return (await this.axios.delete(url)).data;        
        }catch(e){
            console.log(e.response.data)
        }
    }
    async post(url,body){
        try{
            console.log('trello','post',url)
            url='https://api.trello.com'+url;
            return (await this.axios.post(url,body)).data;        
        }catch(e){
            console.log(e.response.data)
        }
    }
    async put(url,body){
        try{
            console.log('trello','put',url)
            url='https://api.trello.com'+url;
            return (await this.axios.put(url,body)).data;        
        }catch(e){
            console.log(e.response.data)
        }
    }
    async get(url){
        console.log('trello','get',url)
        try{
            url='https://api.trello.com'+url;
            return (await this.axios.get(url)).data;        
        }catch(e){
            console.log(e.response.data)
        }
    }
    // /CALLS
    addListener(listener){
        listener.trello=this;
        this.listeners.push(listener)
        return this;
    }
    getCard(id){        
        
        return new Card(this,id);
    }
    
    async addCardToRelease(issue,version){
        var list =await this.getCardFromIssue(issue.repo.owner,issue.repo.name,issue.id);
        for(var i in this.boards){
            var {short}=this.boards[i];
            var board =this.getBoard(short)
            var column =await board.addColumn(`release ${issue.repo.name} ${version}`)            
            
            if(list.length==0)  await board.addCardFromIssue(issue,column);              
            else                await list.moveTo(column);
        }    
    }
    async addCardFromIssue(issue,scrum){
        var list =await this.getCardFromIssue(issue.repo.owner,issue.repo.name,issue.id);        
        for(var i in this.boards){
            var {short}=this.boards[i];
            var board =this.getBoard(short)
             
            if(list.length==0)  await board.addCardFromIssue(issue,board.scrum[scrum]||scrum);              
            else                await list.moveTo(board.scrum[scrum]||scrum);          
        }    
    }
    async getCardFromIssue(owner,name,issue){
        return await this.getCardFromDescription(`https://github.com/${owner}/${name}/(.*?)/${issue}#`)
    }
    async getCardFromDescription(desc){
        var list =[];
        for(var i in this.boards){
            var board=this.boards[i].id
            var cards=await this.getBoard(board).getCards()
            
            list.push(cards.filter(card=>card.desc&&card.desc.match(desc)))
        }        
        return new CardList(list.flat());
    }

    getBoard(id){
        return this.boards.find(board=>board.id==id||board.short==id)
    }
    getBoards(){
        return this.boards;
    }
    addBoard(id){       
        var board = new Board(this,id) 
        this.boards.push(board);

        return board;
    }

    /* listener */
    addIssue(cardid,owner,repo,issueId){
        this.listeners.forEach(listener=>listener.addIssue(cardid,owner,repo,issueId))
    }
    addLabelToCard(id,name,label,board){
        this.listeners.forEach(listener=>listener.addLabelToCard(id,name,label,board))
    }

    changeCardDescription(id,desc,oldDesc){
        console.log('changeCardDescription',id,desc,oldDesc)
        this.getCard(id).setDescription(desc,oldDesc);
        this.listeners.forEach(listener=>listener.changeCardDescription(id,desc,oldDesc))
    }

}


class CardList{
    constructor(list){
        this.list=list;
    }
    get length(){
        return this.list.length;
    }
    async moveToDoing(){ 
        for(var i in this.list)  await this.list[i].moveToDoing()        
    }   
    async moveToDone(){
        for(var i in this.list)  await this.list[i].moveToDone()        
    }    
    async moveToQA(){
        for(var i in this.list)  await this.list[i].moveToQA()        
    }
    async moveToApproved(){
        for(var i in this.list)  await this.list[i].moveToApproved()        
    }
    async moveToDevelop(){
        for(var i in this.list)  await this.list[i].moveToDevelop()        
    }
    async moveTo(id){
        for(var i in this.list)  await this.list[i].moveTo(id)        
    }
    async addIssueOnTitle(){
        for(var i in this.list)  await this.list[i].addIssueOnTitle()        
    }
    async delete(){
        for(var i in this.list)  await this.list[i].delete()                
    }
}

Trello.CardList=CardList
Trello.TrelloListener=TrelloListener
module.exports=Trello