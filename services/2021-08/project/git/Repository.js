var Issue = require('./Issue');
const Release = require('./Release');
const Tag = require('./Tag');
const Beta = require('./Beta');
const Production = require('./Production');
const Develop = require('./Develop');
class Repository{
    constructor(git,name,owner){
        this.git=git;
        this.name=name;
        this.owner=owner;
    }

    async getIssues(status,from){
      //init it is needed to define the absolute status of the issue
      await this.getDevelop()
      await this.getProduction()
      await this.getBeta();

      
      //if(this.issues) return this.issues;
      var {data} =await this.git.call.request('GET /repos/{owner}/{repo}/issues', {
        owner: this.owner,
        repo: this.name,        
        state: status||'all',
        since:from||undefined,
        sort:'updated',
        per_page:100
      })

      this.issues= data.map(item=>
            Issue.loadFromData(this,item)
            )
      return this.issues;
    }
    async getBranches(name){
      //list of branches
      var {data} =await this.git.call.request('GET /repos/{owner}/{repo}/branches', {
        owner: this.owner,
        repo: this.name,    
        per_page:100    
      })
      //filter by name
      data=data.filter(item=>item.name.match(name));
      //add commit in order to have date
      var list =await Promise.all(
        data.map(item=>
          this.git.call.request(`GET ${item.commit.url}`)
          )
      )      
      //add date to the list
      for(var i in data)data[i].date      = new Date(list[i].data.commit.author.date)      

      return data;
    }
    
    async getBeta(){      
      if(this.beta!=undefined) return this.beta;
      
      var tags=await this.getTags();
      if(!tags || tags.length==0) {this.production=null; return {};}
      var release = tags.find(item=>item.name.startsWith("RC"))

      this.beta=new Beta(this,{name:release.name,from:release.date, issues:[]});
      return this.beta;
    }
    async getProduction(){
      if(this.production!=undefined) return this.production;
      
      var tags=await this.getTags();
      if(!tags || tags.length==0) {this.production=null; return {};}
      var release = tags.find(item=>!item.name.startsWith("RC"))
      
      this.production= new Production(this,{name:release.name,from:release.date,issues:release.issues});
      return this.production;
    }
    async getDevelop(){
      if(this.develop!=undefined) return this.develop;
      
      var last =await this.getProduction();      
      this.develop= new Develop(this,{ issues:this.noTaggedIssue});
      return this.develop;
    }
    async getTags(){
      if(this.tags) return this.tags;

      //load  all tags
      var {data} =await this.git.call.request('GET /repos/{owner}/{repo}/tags', {
        owner: this.owner,
        repo: this.name,      
      })
      //load all the commits to bring dates
      var list =await Promise.all(
        data.map(item=>
          this.git.call.request(`GET ${item.commit.url}`)
          )
      )
      //add dates to tags          
      for(var i in data)data[i].date      = new Date(list[i].data.commit.author.date)      
      //order from older
      data=data.sort((a,b)=>a.date-b.date)

      /*
      //add issues to tags
      var issuesClosed=(await this.getIssues('closed')).filter(item=>item.closed);  
      for(var i in data){        
        data[i].issues    = issuesClosed.filter(item=>item.closed && item.closed<=data[i].date)
        issuesClosed=issuesClosed.filter(item=>item.closed && item.closed>data[i].date);
      }      
      this.noTaggedIssue=issuesClosed;   
      */

      this.tags=data.map(item=>new Tag(this,item)).reverse();    
      return this.tags;
    }


    async getReleases(){
      if(this.releases) return this.releases;
      var {data} =await this.git.call.request('GET /repos/{owner}/{repo}/releases', {
        owner: this.owner,
        repo: this.name,      
      })
      
      this.releases=data.map(item=>new Release(this,item));
      return this.releases;
    }
    async getIssue(id){
        return await Issue.load(this,id)
    }
    async newIssue(name){
        console.log("issue","created",name)

        var resp =await this.git.call.request('POST /repos/{owner}/{repo}/issues', {
            owner: this.owner,
            repo: this.name,
            title: name,
            body: 'This is just a test',
            assignees: [
              'massimilianoregis'
            ],            
            labels: [
              'bug'
            ]
          })
        this.git.newIssue(this.name,this.owner,resp.data)
        return resp.data;
    }
    async addWebHook(url,...events){
      //console.log('github','addWebHook',url,events)
        try{          
        await this.git.call.request('POST /repos/{owner}/{repo}/hooks',{
            owner: this.owner,  
            repo: this.name,
            name: 'web',
            active: true,
            events: events,
            config: {
              url: url,
              content_type: 'json',
              insecure_ssl: '1'
            }
        })
        }catch(e){console.error('git','webhook already exists')}
        return this;
    }

    async toJSON(){
      var dev = await this.getDevelop();
      var beta = await this.getBeta();
      var prod = await this.getProduction();
      var issues = (await this.getIssues("open")).filter(item=>item.constructor.name=="Issue");
      for(var i in issues){
        issues[i]=await issues[i].toJSON()
      }
      return {
        name:this.name,        
        develop:    dev &&await dev.toJSON(),        
        beta:       beta&&await beta.toJSON(),
        production: prod&&await prod.toJSON(),
        openIssues: issues
      }
    }
}
module.exports=Repository