const AWS= require('aws-sdk');
const S3 = new AWS.S3();
const puppeteer = require('puppeteer');
class Pdf{
    async saveCache(id,data,s3Path){
        const split=s3Path.split(":/")
        var params = {Bucket: split[0], Key:`${split[1]}/${id}.pdf`, Body: data};        
		return await (S3.upload(params).promise())		
    }
    async create(url,jwt){        
        const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none','--allow-file-access-from-files', '--enable-local-file-accesses']});
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36");
        try {               
            if(jwt) page.setExtraHTTPHeaders({auth:jwt})

            const options={                
                format: 'Letter'
            }
            await page.goto(url);		
            
            return await page.pdf(options);
        }
        finally{
            await page.close();
            await browser.close();
        }
		

    }
}

const lambda = new AWS.Lambda({region:"us-west-1"});
class Lambda{    
    async create(id,jwt){        
            const params = {
                FunctionName: 'pdf', 
                Payload: JSON.stringify({id: id,jwt:jwt})    
            };
            const result = await lambda.invoke(params).promise();
            return result;
        }

}
module.exports.Pdf= Pdf;
module.exports.Lambda=Lambda;