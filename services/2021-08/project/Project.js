const Trello = require("./trello/Trello");
const {TrelloListener} = require("./trello/Trello");
const Git = require("./git/Git");
const {GitListener} = require("./git/Git");
const PR = require("./git/PR");

/*
GITHUB          TRELLO                  GITHUB
                add label               create issue
                move column
create PR       create tech card doing
ask approve     move card in done
approved        move catd in approved
PR merged       move card in develop
                change a card           update the card
                move card to TODO       add next release label
*/

 

class Project extends TrelloListener//,GitListener
{

    constructor(config){
        super();
        if(!config) return;
        if(config.git) this.git=Git.config(config.git).addListener(this);
        if(config.trello) this.trello=Trello.config(config.trello).addListener(this)      
        //setTimeout(()=>this.test(),2000)
    }

    async test(){    
        for(var i in this.git.repositories){             
            var repo = this.git.repositories[i]
            var issues =await repo.getIssues('all');
            console.log(repo.name)            
            
            console.log(await Promise.all(issues.map(issue=>issue.toString())))
            for(var i in issues){
                var issue=issues[i];                
                await this.setIssueInTrello(issue);
            }
            
            try{
                var develop=await repo.getDevelop();
                console.log(develop.toJSON())
                console.log((await develop.getIssues()).map(item=>`${item.id}) ${item.title}`))
            }catch(e){console.log(e);}    
            try{console.log((await repo.getBeta()).toJSON())                }catch(e){} 
            try{console.log((await repo.getProduction()).toJSON())          }catch(e){}       
            //console.log(await Promise.all(issues.map(issue=>issue.toString())))
            
        }

    }
    async setIssueInTrello(issue){
        if(!this.trello)return;
        var boards=this.trello.getBoards();
        for(var i in boards){
            var board=boards[i]
            var list = await board.getCardsFromIssue(issue.repo.owner,issue.repo.name,issue.id);
            var status =await issue.status()

            if(list.length>0){
                if(status=='closed') 
                    return await list.delete();
                else{
                    await list.addIssueOnTitle();                
                    await list.moveTo(status)                
                }
            } else {                
                await board.addCardFromIssue(issue,status);
            }
        }        
    }
    
    async onGitChange(project,owner,pr){
        //this.syncIssueOnTrello(owner,project,pr)
    }
    async newIssue(project,owner,name){}
    async onPRDraft(project,owner,pr,issue){}
    async onPRwaitingForApproval(project,owner,pr,issue){}
    async onPush(project,owner,issue){}
    async onMerge(project,owner,pr,issue){}
    async changeCardDescription(id,desc,oldDesc){}
    async addIssue(cardid,owner,repo,issueId){        
        //await this.syncIssueOnTrello(owner,repo,issueId)
    }

    async addLabelToCard(id,name,label,board){    
        if(!this.trello)return;
        console.log('addLabelToCard')
                
        if(label=='next release'){
           var issue= await this.trello.getCard(id).getIssue('open');

           var gitIssue =await this.git.getRepository(issue.repo,issue.owner).getIssue(issue.id)
           await gitIssue.addLabel('next release')
        }

        var project=this.trello.getBoard(board).getProjectFromLabel(label);
        if(project){
            var issue=await this.git.getRepository(project,'secmedhub').newIssue(name);
            //add a link with the issue
            await this.trello.getCard(id).addDescription(issue.html_url)
        }        
    }

    async toJSON(){
        return {
            git:await this.git.toJSON(),
            trello:this.trello
        }
    }
}
module.exports=Project