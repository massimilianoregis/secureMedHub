var Router=require("service-libs/aws/router");

const localStorage = require('service-libs/http/localStorage'); 
localStorage.set({app:new Router()},()=>{
        require("./index");        
    });

exports.handler = async (event,context,callback)=>{
    return {
        statusCode:200,
        isBase64Encoded:false,
        headers:{},
        body:JSON.stringify(await router.execute(event))
    }
}

