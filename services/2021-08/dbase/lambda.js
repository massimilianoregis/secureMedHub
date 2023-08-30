var router=require("./lib/router");
var app = require("./index");
exports.handler = async (event,context,callback)=>{
    return {
        statusCode:200,
        isBase64Encoded:false,
        headers:{},
        body:JSON.stringify(await router.execute(event))
    }
}

