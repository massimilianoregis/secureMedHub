const {Service}= require("service-libs");
var app = new Service()
    .addDefaultConfig()
    .addJsDoc(__dirname)
    .app

app.get(`/test`, async (req,res,next) => {
	res.json("Yes")
})

module.exports = app;