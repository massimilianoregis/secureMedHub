var winston = require('winston');
require('winston-daily-rotate-file');
const Action = require("../Action");

class Log extends Action{
    constructor(name, datePattern,dir){    
        super();
        var transport = new winston.transports.DailyRotateFile({
            filename: name,
            datePattern: datePattern,
            zippedArchive: true,
            dirname:dir,
            maxSize: '50m',	    
            timestamp:true,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
          });
       
          var logger = winston.createLogger({
            transports: [
              transport
            ]
          });   

          this.logger=logger;
    }
    async before(id,req){        
        this.logger.info(`|${id}| ${req.user?.email} ${req.method} ${req.originalUrl} [STARTED]`)  
        if(req.originaUrl?.match("202?-0?/auth")) return; //this row in order to avoid to show password
        if(req.originaUrl?.match("2021-08/dbase")) return; //it is not usefull show all the detail
        if(req.method=="POST") this.logger.info(`|${id}| ${req.body}`)
        if(req.method=="PUT") this.logger.info(`|${id}| ${req.body}`)
    }
    async after(id,req,res,data){        
        this.logger.info(`|${id}| ${req.user?.email} ${req.method} ${req.originalUrl} ${res?.statusCode} [FINISHED]`)	    
        if(req.originaUrl?.match("202?-0?/auth")) return; //this row in order to avoid to show password
        if(req.originaUrl?.match("2021-08/dbase")) return; //it is not usefull show all the detail
        if(data) this.logger.info(`|${id}| ${JSON.stringify(data)}`)
        
    }
}
module.exports=Log
