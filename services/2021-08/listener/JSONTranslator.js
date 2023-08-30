/**
 * a class to transform a json to another json
 */
class JSONTranslator{
    constructor(config={}){        
        this.data = config;        
        this.fcts=
            Object.entries(config).map(([key,value])=>
                ({key:key, fct:new Function("request","response",`return ${value}`),value:value})
            )
    }

    async translate(){                  
        let data = {...this.data}        

        await Promise.all(this.fcts.map(item => {      
            var {key,fct,value}= item;
            try{
                if(key=="body") data= fct(...arguments)
                else            data[key]= fct(...arguments)
                
            } catch(e){
                //this is needed to fix all the replacemnete with plain string in config
                if(e instanceof ReferenceError){                   
                   fct = new Function("request","response",`return '${value}'`)
                   item.fct=fct;
                   if(key=="body") data= fct(...arguments)
                   else            data[key]= fct(...arguments)
                }
                else
                    console.log(e)
            }            
        }))
        return data;
    }
}

module.exports = JSONTranslator