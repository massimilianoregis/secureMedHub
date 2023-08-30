const { transform } = require("async");
const crypto = require("crypto")
var fs = require('fs')
var path = require('path')

function replacer(key,value){    
    if (this[key] && typeof this[key].getTime === 'function') { return { $$date: this[key].getTime() }; }
    return value
}

class Dump{
    uuids ={} 
    constructor(name){
        console.log(`${__dirname}/${name}.nedb`)
        this.db = fs.createWriteStream(name, {
            flags: 'a' // 'a' means appending (old data will be preserved)
          })
    }
    uuid () {
        const len=16;
        var uuid;
        do{
        uuid = crypto.randomBytes(Math.ceil(Math.max(8, len * 2)))
          .toString('base64')
          .replace(/[+\/]/g, '')
          .slice(0, len);
        }while(this.uuids[uuid])
        this.uuids[uuid]=true;
        return uuid;
      }
    add(data){
        if(Array.isArray(data))
            return data.forEach(item=>this.add(item))

        const transform=data;
        transform._id = this.uuid();
        var row = JSON.stringify(transform,replacer)+"\n";
        
        this.db.write(row)
    }
    end(){
        this.db.end();
    }
}

module.exports=Dump