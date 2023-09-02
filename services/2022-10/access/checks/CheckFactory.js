const Url=require('./Url')
const Role=require('./Role')
class CheckFactory{
    static create(value,generalConfig){
        
        var match =value.match('(?<label>.*):\\s?(?<name>.*)')
        if(match==null) return new Url(value)

        var {label,name} =match.groups    
                
        if(label==="role")           
            return new Role(
                name,
                generalConfig.find(item=>item.name==name).items,
                generalConfig
                )         

        if(label=='url')
            return new Url(name)
    }
}
module.exports=CheckFactory