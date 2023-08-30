
        const proxy = require("../../../util/proxy");
        const app = require("express")();
            app.use(proxy("http://localhost:3900"));
        module.exports=app;
        