var pt = require("path");

class FileSystem{
    constructor(key,secret){}
    async copy(from,to){}    
    async move(from,to){}
    async delete(path){}
    async save(path,data){}
    async merge(from,to){}
    async exists(path){}
    async readStream(path){}
    async save(path,file){}
    async list(path,token,pageSize){}
}


const AWS = require('aws-sdk');

class S3 extends FileSystem{
    constructor(key,secret){
        super();
        this.key=key;
        this.secret=secret;
        this.zone="us-west-1"
        this.s3= new AWS.S3({
            region:this.zone,
            accessKeyId: key,
            secretAccessKey: secret
            });   
    }
    parse(name){
        var path = name.match(/(?<Bucket>.*?)\:\/(?<Key>.*)/i)
        if(path) return path.groups;
        else    return {Bucket:this.name,Key:name};
    }

    async copy(from,to){
        var from = this.parse(from);
        var to = this.parse(to);
        
        await this.s3.copyObject({
            Bucket:to.Bucket,
            Key: to.Key,
            CopySource:`${from.Bucket}/${from.Key}`
        }).promise()
    }
    async delete(path){
        var params = this.parse(path)     
        await this.s3.deleteObject(params).promise()
    }

    async exists(path){
        try{
            var data = this.parse(path)
            var list = await this.s3.getObject(data).promise()
            return true;
            }
        catch(e){            
            return false    
        }
    }
    async list(path,token,pageSize){
        path = this.parse(path)
        token=token?token.replace(" ","+"):null;        
        try{
            var params = {
                Bucket: path.Bucket, 
                Prefix: path.Key,
                MaxKeys:pageSize||1000,
                ContinuationToken:token          
            };                 
            var list = await this.s3.listObjectsV2(params).promise()
            var token=list.NextContinuationToken;
            var keyCount=list.KeyCount;
            list= list.Contents.map(item=>({
                path:`${path.Bucket}:/${item.Key}`,
                name:item.Key.substring(path.length+1),
                changed: new Date(item.LastModified),
                size:item.Size
            }))
            list.next=token
            list.count=keyCount;
            
            return list;
            }
        catch(e){
            console.log(e)
            return false    
        }
    }
    async mostRecent(path){            
        var list = await this.list(path);
        return (list.sort((a,b)=>b.changed-a.changed))[0]
    }

    async readStream(path,stream){                                  
        path = this.parse(path)
        var params = {Bucket: path.Bucket, Key:path.Key};
        var str = this.s3.getObject(params).createReadStream();
        str.on('error',(err)=>{stream.end();})        
        str.pipe(stream)
        
    }
    async write(path,data){                                  
        path = this.parse(path)
        var params = {Bucket: path.Bucket, Key:path.Key , Body: data};
        
        var result = await (this.s3.upload(params).promise())
        //console.log(result);     
        return result;  
    }
    async save(path,data){                                  
        path = this.parse(path)
        var params = {Bucket: path.Bucket, Key:path.Key , Body: JSON.stringify(data)};
        
        var result = await (this.s3.upload(params).promise())
        //console.log(result);     
        return result;  
    }

}

const { JsonDB } =require('node-json-db');
const { Config } =require('node-json-db/dist/lib/JsonDBConfig');


class Dir {
    constructor(s3,path){
        this.s3=s3;
        this.path=path;
        
    }
    async list(){
        var list = await this.s3.list(this.path);        
        list.forEach(item=>this.db.push(item.name,item.size?{changed:item.changed,size:item.size}:{changed:item.changed}))
            
        console.log(this.db)
        return this.db.getData("/");
    }

    async get(path){ 
        return new Dir(
            this.s3,
            pt.join(this.path,path)
            );
    }
}


module.exports.S3=S3
module.exports.Dir=Dir