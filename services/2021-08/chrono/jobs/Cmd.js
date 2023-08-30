var Job = require("../Job")
const { exec } = require("child_process");
class Cmd extends Job{
    async execute(){
        var {groups} = this.command.match("(?<verb>GET|POST|PUT|DELETE)?\\s?(?<url>.*)")
        var {verb,url} = groups; 

        if(!verb)
            exec(this.command,(error, stdout, stderr)=>{
                console.log(stdout)
            });
        if(verb)
            await Job.services[verb.toLowerCase()](url)
    }
}
module.exports=Cmd;