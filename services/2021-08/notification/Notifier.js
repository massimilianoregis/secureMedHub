var ChainFactory = require("./ChainFactory");
const FeatureChain = require("./FeatureChain");
const Workflow = require("./Workflow");
class Notifier {    
    
    static new(config,services){

        //create feature chain
        //FeatureChain { list: [ AlternateMail {} ] }
        //ChainFactory [ AlternateMail {} ]
        var feature = new FeatureChain(ChainFactory.new(config.features,"./sender",services));

        //create workflows chain
        var workflows= ChainFactory.new(config.workflows,"./workflow",services,feature);

        Workflow.services=services;
        //add workflows to express
        var app = require("express")();

        workflows.forEach(work=>{
            work.addToExpress(app,feature,work.url,config);
        })
        return app;
    }
}


module.exports=Notifier