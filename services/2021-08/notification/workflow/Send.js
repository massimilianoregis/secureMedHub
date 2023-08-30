const Workflow = require('../Workflow');
class Send extends Workflow{
    constructor(e) {
        super()
        this.url = e.url
    }
    execute(request,response){
        
    }
}
module.exports=Send;