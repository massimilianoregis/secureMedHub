const fs = require('fs')
const path = require('path')
class Finder{
    constructor(dir){
        this.dir=path.resolve(process.cwd(),dir);
    }

    testDir(dir,rel='./'){
        var ext  = path.extname(dir)||'.tsx';
        var file = path.basename(dir);   
        var dir  = path.dirname(dir);             
            dir  = path.resolve(dir,rel);

        var act = path.resolve(dir,file,ext)
        if(fs.existsSync(act))
            return path.relative(this.dir,act);

        var act = path.resolve(dir,'Generic'+ext)   
        if(fs.existsSync(path.resolve(dir,'Generic'+ext)))
            return path.relative(this.dir,act);
    }
    get(value){                                  
        var dir= path.resolve(this.dir,value);
        
        var result =this.testDir(dir)
        if(result) return result;

        var result =this.testDir(dir,'../')
        if(result) return result;
    }
}
(()=>{
    var finder = new Finder('./_ui/src/components')
    console.log(finder.get('visit/dermatologist/Visit'))
})()