var app = require("express")();
app.get("/info",(req,res)=>{
	res.json({})
})
app.get("/",async(req,res,next)=>{
    res.end("shell")
})
app.get("/cmd/:cmd(*)",async(req,res,next)=>{
    res.end(req.params.cmd)
})

module.exports=app
    