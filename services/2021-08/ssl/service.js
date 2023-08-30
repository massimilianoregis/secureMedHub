const {Service} = require("service-libs")
const path= require("path")
const fs= require("fs")
const tls = require("tls");
var SSLForFree = require("./sslForFree")
const node_openssl = require('node-openssl-cert');
var sslTool = require('ssl-key-match');
const openssl = new node_openssl();
const moment = require("moment");

class Certificate{    
    constructor(domain,csrData,password,root){        
        this.root=root||path.resolve(__dirname,"certificates",domain);        
        this.domain=domain;
        this.password=password
        this.csrData=csrData||{
            locality:"",
            organization:"",
            email:"",
            domains:[""]
            };       
        this.init();        
    }

    async init(){        
        var available = await this.available()
        try{ fs.mkdirSync(this.root,{recursive:true});}catch(e){}
                        
        if(!fs.existsSync(`${this.root}/certificate.crt`) )     fs.writeFileSync(`${this.root}/certificate.crt`,"");
        //when certificate changes.. changes the secure context
        fs.watchFile(`${this.root}/certificate.crt`,{ interval: 60000 },()=>{
            this.createSecureContext();
        })

        try{this.createSecureContext();}catch(e){}
        if(available.length>0)
            this.setCurrentCertificate(available[0])                 
    }

    /*
    list of 
        {
            dir:
            abs:
            exp:
        }
    */
    installed(){
        try{fs.mkdirSync(this.root,{recursive:true});}catch(e){}
        return  fs.readdirSync(this.root)
            .filter(dir=>
                fs.existsSync(`${this.root}/${dir}/private.key`)&&
                fs.existsSync(`${this.root}/${dir}/certificate.crt`)&&
                fs.existsSync(`${this.root}/${dir}/ca_bundle.crt`)
                )
            .map(dir=>({
                dir:dir,
                abs: path.resolve(this.root,dir),
                exp:new Date(dir)}))            
            .sort((a,b)=>a.exp-b.exp);        
    }
    hasPrivateKey(){
        return fs.existsSync(`${this.root}/private.key`)
    }
    hasCSR(){
        return fs.existsSync(`${this.root}/csr.crt`)
    }
    getCSR(){
        return fs.readFileSync(`${this.root}/csr.crt`).toString()
    }
    
    async isRightKey(dir){        
        return new Promise((ok,ko)=>{
            var cert = fs.readFileSync(`${dir}/certificate.crt`);
            var key = fs.readFileSync(`${dir}/private.key`);
            sslTool.match(cert,key,(err,matches)=>{
                console.log("ssl","isRightKey",dir,matches)
                !err&&matches?ok(true):ok(false);
            })
        })
        
    }
    async available(){        
        const today= new Date();        
        var list =(this.installed())
            .filter(item=>item.exp>today);
        for(var i in list){
            var item = list[i];
            
            list[i]=(await this.isRightKey(item.abs))?item:null        
            if(!list[i]) fs.rmSync(item.abs, { recursive: true });
            }
        return list.filter(item=>item);                                
    }

    async downloadCertificates(domain){
        console.log("*","certificate","download")
        const sslForFree = Certificate.sslForFree
        domain = domain||this.domain;
        var list = (await sslForFree.getValidCertificates(domain)).sort((a,b)=>new Date(a.created)-new Date(b.created))
        for(var i in list){
            const {id,expires,created} = list[i];
            var data =await sslForFree.getFile(id)
            const {bundle, certificate}=data;
            await this.saveOnDir(new Date(expires),bundle, certificate,created)
        }
    }

    async saveOnDir(expire,bundle,certificate,created){              
        var dir = path.resolve(this.root,moment(expire).format("YYYY-MM-DD"));
        console.log("*","certificate","saveonlocal",expire,created)          
        try{    
            fs.mkdirSync(dir,{recursive:true});        
        }catch(e){}
        fs.writeFileSync(path.resolve(dir,"ca_bundle.crt"),bundle);
        fs.writeFileSync(path.resolve(dir,"certificate.crt"),certificate);
        fs.copyFileSync(path.resolve(this.root,"csr.crt"),path.resolve(dir,"csr.crt"))
        fs.copyFileSync(path.resolve(this.root,"private.key"),path.resolve(dir,"private.key"))        
    }

    async createCSRAndPrivateKey(password,csrData){
        var key = await this.createPrivateKey(password)
        var csr = await this.createCSR(csrData,key,password)
        return {csr:csr,key:key}
    }
    async createPrivateKey(password){        
        console.log("*", "certificate","createPrivateKey")
        return new Promise((ok,ko)=>{
            password=password||this.password;
            const options = {            
                rsa_keygen_bits: 2048,
                format: 'PKCS8',
               /* encryption: {
                    password: password,
                    cipher: 'des3'
                }*/
            }
            openssl.generateRSAPrivateKey(options, (err, key, cmd)=>{                
                if(err) return ko(err);
                const file = path.resolve(this.root,"private.key")
                fs.writeFileSync(file,key)                
                ok(key)
            });
        })                
    }
    async createCSR(data,key,password){
        console.log("*", "certificate","createCSR");
        return new Promise((ok,ko)=>{
            password=password||this.password;
            var options = {
                hash: 'sha512',
                subject: {
                    countryName: data.country||'US',
                    stateOrProvinceName: data.state||'CA',
                    localityName: data.locality||"",
                    postalCode: data.zip||"",
                    streetAddress: data.address||"",
                    organizationName: data.organization||"",				
                    commonName: data.domains||[],
                    emailAddress: data.email
                }
            };
            openssl.generateCSR(options, key, password,(err, csr, cmd) =>{
                if(err)return ko(err);
                const file = path.resolve(this.root,"csr.crt")
                fs.writeFileSync(file,csr)  
                ok(file)
            })
        })
    }
   
    async createCertificate(password,csrdata){ 
        console.log("*","certificate","create")
        password=password||this.password;
        csrdata=csrdata||this.csrData;
        if(!this.hasCSR() || !this.hasPrivateKey())
            await this.createCSRAndPrivateKey(password,csrdata);                    

        //create certificate
        return await Certificate.sslForFree.createAndVerify(this.domain,this.getCSR())               
    }
    async installCertificate(){        
        //just one creation no multiple
        if(this._creating) return;
        this._creating=true;      

        try{               
            var list = await this.available();            
            //ok! I have one certificate 
            if(list.length>0) return list[0]; 
            
            console.log("ssl","no one certificate available")

            //try to download the certificate
            console.log("ssl","download certificate")
            if(this.hasPrivateKey())    await this.downloadCertificates();                      
                        
            console.log("ssl","check if now is ok")
            list = await this.available();
            //ok.... I have to create a new one
            if(list.length==0) {
                console.log("ssl","I have to create certificate")
                await this.createCertificate(this.password,this.csrData);
                await this.downloadCertificates();   
                list = await this.available()
            }
                        
            if(list.length>0) return list[0];

        }finally{
            this._creating=false;   
        }        
    }

    setCurrentCertificate(cert){
        if(!cert) return;   
        this.current=cert
        fs.copyFileSync(`${cert.abs}/private.key`,`${this.root}/private.key`)
        fs.copyFileSync(`${cert.abs}/csr.crt`,`${this.root}/csr.crt`)   
        fs.copyFileSync(`${cert.abs}/certificate.crt`,`${this.root}/certificate.crt`)
        fs.copyFileSync(`${cert.abs}/ca_bundle.crt`,`${this.root}/ca_bundle.crt`)  
        
        //Node have a bug on dinamically ca_bundle
        //one solution is here: https://www.npmjs.com/package/ca-append
        //now I will use a generic bundle on the root in order to avoid performance issue  
        fs.copyFileSync(`${cert.abs}/ca_bundle.crt`,path.resolve(__dirname,"certificates","ca_bundle.crt"))  
    }

    
    toJSON(){        
        return {
            domain:this.domain,
            dir:this.current?this.current.dir:undefined,
            expiration:this.current?this.current.exp:undefined
        }    
    }

    //this is automatically called when the certificate.crt changes
    createSecureContext(){        
        var cert= tls.createSecureContext({
            key: fs.readFileSync(`${this.root}/private.key`),
            cert: fs.readFileSync(`${this.root}/certificate.crt`),
            ca: fs.readFileSync(`${this.root}/ca_bundle.crt`)
        })                
        this.secureContext=cert;
    }
    
    

    static getInstance(domain){
        if(!this._instances) this._instances={};
        if(this._instances[domain]) return this._instances[domain];
        
        this._instances[domain]=new Certificate(domain);

        return this._instances[domain]
    }
    static instances(){        
        return this._instances;
    }
}
Certificate.sslForFree=new SSLForFree()

var https=require("https");
class SSL{
    get sslForFree()        {return Certificate.sslForFree;}
    set sslForFree(value)   {Certificate.sslForFree.accessKey=value;}
    async installCertificate(domain){
        console.log("\t","ssl install".yellow)
        return await Certificate.getInstance(domain).installCertificate();
    }
    availableCertificates() {
        return this.domains.map(domain=>Certificate.getInstance(domain).current)
    }
    addDomain(domain){
        this.domains=this.domains||[];    
        if(this.domains.includes(domain) ) return;
        this.domains.push(domain)
    }
    async enable(gateway,port){        
        try{
            gateway.use(this.sslForFree.getApp());     

            //Node have a bug on dinamically ca_bundle
            //one solution is here: https://www.npmjs.com/package/ca-append
            //now I will use a generic bundle on the root in order to avoid performance issue        
            var options = {
                ca: fs.readFileSync(path.resolve(__dirname,"ca_bundle.crt")),
                SNICallback:(domain,cb)=>{                
                    var cert = Certificate.getInstance(domain).secureContext;         
                    cb(null,cert);
                }
            }   
        
            var server = https.createServer(options, gateway.app||app)                   
            
            if(port){ 
                server.listen(port);
                console.log(`https online at port ${port}`.green.bold)
            }        
            return server;    
        }catch(e)  {console.log("ssl enable",e)}
    }    
}

module.exports = SSL;