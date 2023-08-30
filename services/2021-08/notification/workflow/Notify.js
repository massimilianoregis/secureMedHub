const Workflow = require('../Workflow');
const services = require('../../../../util/services')
class Notify extends Workflow{
    constructor(e) {
        super()
        this.url = e.url
        this.to = e.data.to
        this.template = e.data.template
        this.data = e.data.context
    }
    async execute(request,response,config,sender,req){
		let to = eval(this.to)
		let template = eval(this.template)
		
		let data = request.data
        if(response.error == undefined) {
            if(data == undefined){
                data = this.data
            }
            await Notify.services.klaviyo({template: template, to: to, context: data, share: true})
        }
    }
}
module.exports=Notify; 