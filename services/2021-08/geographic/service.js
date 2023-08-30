var fs =require("fs")
class Geo{
    async load(){
        if(this.data) return this.data;
        this.data = require("./countries.json")
        return this.data;
    }
    async import(){
        var data = require("./db.json")
        this.data = data.map(country=>({
            id:country.id,
            name:country.name,
            iso2:country.iso2,
            emoji:country.emoji,
            states: country.states.filter(state=>state.cities.length>0).map(state=>({
                id: state.id,
                name:state.name,
                cities: state.cities.map(city=>({
                    id:city.id,
                    name:city.name
                }))
            }))
        }))
        
        fs.writeFileSync(__dirname+"/countries.json",JSON.stringify(this.data,2,2))
        return this.data;
    }
   /**
   * A Countries
   * @typedef {object} Country
   * @property {string} id.required.uuid - uuid
   * @property {string} name - name
   * @property {string} iso2 - the code
   * @property {string} emoji - the flag
   */
    async countries(){
        var data = await this.load();
        return data.map(country=>({
            id:country.id,
            name:country.name,
            iso2:country.iso2,
            emoji:country.emoji          
        }))
    }

    /**
   * A State
   * @typedef {object} State
   * @property {string} id.required.uuid - uuid
   * @property {string} name - name   
   */
    async states(country){
        var data = await this.load();
    
        return data.find(item=>
            item.id==country||item.iso2==country
        ).states.map(state=>({
            id:state.id,
            name:state.name
        }))
    }
    /**
   * A City
   * @typedef {object} City
   * @property {string} id.required.uuid - uuid
   * @property {string} name - name   
   */
    async cities(country,state){
        var data = await this.load();
        
        return data.find(item=>
            item.id==country||item.iso2==country
        ).states.find(item=>
            item.id==state||item.name==state
        ).cities.map(state=>({
            id:state.id,
            name:state.name
        }))
    }
}

module.exports = Geo;