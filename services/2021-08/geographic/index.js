var {Service} =require("service-libs");
var Geo = require("./service");

var geo = new Geo();
var app = new Service()    
    .addDefaultConfig()
    .addJsDoc(__dirname)
    .app;
app.get("/import",async (req,res)=>{
    try{
        await geo.import();
        
        res.json({})
    }catch(e){
        console.log(e);
    }
})


 /**
 * GET /2021-08/geographic/{country}/{state}/cities
 * @summary list of cities
 * @param {string} country.path.required - name param description
 * @param {string} state.path.required - name param description
 * @return {array<City>} 200 - success response
 * @tags Geographic
 */
app.get("/:country/:state/cities",async (req,res)=>{
    var {country,state} = req.params;
    if(!country) return res.json([]);
    if(!state) return res.json([]);
    const result = await geo.cities(country,state);    
    res.json(result)
})

/**
 * GET /2021-08/geographic/{country}/states
 * @summary list of states
 * @param {string} country.path.required - name param description
 * @return {array<State>} 200 - success response
 * @tags Geographic
 */
app.get("/:country/states",async (req,res)=>{
    var {country} = req.params;
    if(!country) return res.json([]);
    const result = await geo.states(country)  
    result.forEach(item=>item.statesLink=app.call.citiesUrl({country:country,state:item.name}))
    res.json(result)
})

/**
 * GET /2021-08/geographic/countries
 * @summary list of countries
 * @return {array<Country>} 200 - success response
 * @tags Geographic
 */
app.get(["/countries","/"],async (req,res)=>{   
    const result = await geo.countries()    
    
    result.forEach(item=>item.citiesLink=app.call.statesUrl({country:item.iso2}))
    res.json(result)
})


module.exports=app;