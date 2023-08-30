class Calls{
    services=null;
    _calls=0;
    maxCalls=0;
    waitingList=[];
    constructor(services,maxCalls){
        this.maxCalls=maxCalls||5
        this.services=services;
    }
    get calls()         {return this._calls;}
    set calls(value)    {         
        this._calls=value;        
    }
    get isOk(){
        console.log(this.calls,this.maxCalls,this.calls<=this.maxCalls)    
        return this.calls<=this.maxCalls;
    }
    go(){
        var res=this.waitingList.pop()
        if(res) res();
    }
    waiting (){   
        console.log(this.isOk,"waiting") 
        if(this.isOk) return;    
        
        return new Promise(ok=>{
            this.waitingList.push(ok);
        })              
    }
    async get(url){        
        this.calls++;
        await this.waiting();        
        try{            
            return await this.services.get(url)
        }finally{
            this.calls--;
            this.go();
        }        
    }
    async post(url,data){        
        this.calls++;
        await this.waiting();        
        try{            
            return await this.services.post(url,data)
        }finally{
            this.calls--;
            this.go();
        }        
    }
    async delete(url){        
        this.calls++;
        await this.waiting();        
        try{            
            return await this.services.delete(url)
        }finally{
            this.calls--;
            this.go();
        }        
    }
}

module.exports=Calls;