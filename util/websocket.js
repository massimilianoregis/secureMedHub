var http = require("http")
var socketIo = require("socket.io")

var socket ={
	emit:function(name,data){
		this.io.emit(name,data);
	},
	listen:function (servers){		
		this.io = socketIo()
		servers.forEach(server=>{				
			this.io.listen(server);						
		})
	}
}

module.exports=socket;