var app = require("express")();
try{
    require("./swagger")(app)
    }catch(e){
            console.log(e)
    }
module.exports=app;