
var domain="https://my.securemedhub"

module.exports = {
  ...require("./secrets"),  
  gateway: "http://localhost:3000",
  heartbeat: "/2021-08/status",
  jwt: "${JWT_BOT}",
  services: {                
        "/2021-08/proxy":{
            initialStatus:"on",
            defaultClass:"Proxy",
            listen: {                               
            }
        },   
        "/2023-06/patient":{
            db: "2023-06/patient/db",
            calls:{
                visit:"GET /2023-06/visit/patient/${patientId}",
                vitalSigns:"GET /2023-06/vitalSigns?patientId=${id}",
                prescription:"GET /2023-06/prescription?patientId=${id}",
                bloodwork:"GET /2023-06/bloodwork?patientId=${id}"
            }
        },
        "/2023-06/bloodwork":{
            db: "2023-06/bloodwork/db"
        },
        "/2023-06/prescription":{
            db: "2023-06/prescription/db"
        },
        "/2023-06/vitalSigns":{
            db: "2023-06/vitalSigns/db"
        },
        "/2023-06/dermatologist":{
            db: "2023-06/visit/db",
            calls:{
                assessment:"GET /2023-06/dermatologist/assessment?visit=${visitId}",
                procedures:"GET /2023-06/dermatologist/procedure?visitId=${visitId}",
            }
        },
        "/2023-06/visit":{
            db: "2023-06/visit/db",
            calls:{
                dermatologist:"GET /2023-06/dermatologist/visit?patientId=${patientId}",
                patient:"POST /2023-06/patient",
                vitalSigns:"POST /2023-06/vitalSigns",
                prescription:"POST /2023-06/prescription"
            }
        },
        "/2022-10/access": {
            secret: "${JWT_SECRET}",
            excludeJwt:"${JWT_BOT}",
            roles:{
                admin:[
                   "ALL .*"                   
                ],
                unknown:[
                    "ALL /2022-08/auth/login",
                    "ALL /2022-08/auth/registration",
                    "GET /src/.*"                    
                ],
                user:[
                    "role: unknown",
                    "GET /2022-10/auth/me",
                    "ALL /2022-08/auth/logout",
                    "ALL /2023-06/patient" 
                ]
            },            
            calls: {
                jwt: "GET /2022-10/auth/jwt/${user}"
            }
        },
        "/2021-08/listener": {
            listen: {      
                "":{
                    cls:{"Log":["gateway-%DATE%.log",'YYYY-MM-DD-HH',"logs"]},
                }  
            }              
        },
      "/2021-08/notification": {
            workflows:[             
		  ],
          features:[
              {cls:"RegularMail"},
          ],
		  calls: {			 
		  },		 
      },
      "/2021-08/ssl": {
          sslForFree: "${SSLFORFREE}",
          initSSL: false,
          port: 3001,
          domains: [                           
          ],
          calls: {
              renew: {
                  url: "POST /2021-08/queue/add",
                  body: {
                      name: "ssl ${domain} renew",
                      call: "/2021-08/ssl/initCertificate?domain=${domain}",
                      scheduled: "0 0 ${day} ${month} ?",
                      unique: "keep_the_first"
                  }
              },
              initCertificate: {
                  url: "POST /2021-08/queue/add",
                  body: {
                      name: "ssl ${domain}",
                      call: "/2021-08/ssl/initCertificate?domain=${domain}",
                      unique: "keep_the_first"
                  }
              }
          }
      },  
      "/2021-08/chrono":{     
            disabled: true,            
            defaultClass:"Cmd",
            jobs:[                
            ]    
      },
      "/2021-08/gateway": {
          //heartbeat:60000,
          environment: "develop",
          port: 3000,
          localUI: true,
          calls: {
              install: "POST /2021-08/git/install"                                                  
          }
      },            
      "/2021-08/openApi": {},
      "/2021-08/slackbot": {
          token: "${SLACK_TOKEN}",
          aws: {
              gateway: "9mzpo80qqk",
              type: "lambda"
          }
      },                  
      "/2021-08/communication": {},
      "/2021-08/cache": {
          data:"file:${__dirname}/data",
          listen:{}
      },
      "/2021-08/script": {
          disabled: false,
          calls: {
              test: "POST /2021-08/script/echo"
          }
      },
      "/2021-08/dbase": {               
      },      
      "/2021-08/status": {
      },
      "/2022-10/auth": {      
        facebook: {
          clientId: "${FACEBOOK_CLIENTID}",
          secret: "${FACEBOOK_SECRET}",
          callback: "${gateway}/2022-10/auth/facebook/callback",
          calls:{                  
            logged:"POST /2022-10/auth/socialLogged",
          }
        },
        google: {
          clientId: "${GOOGLE_CLIENTID}",
          secret: "${GOOGLE_SECRET}",                       
          callback: "${gateway}/2022-10/auth/google/callback",
          calls:{                  
            logged:"POST /2022-10/auth/socialLogged",
          }
        },
        account: {              
            jwt:{
                secret: "${JWT_SECRET}",
                exp:'30 days'
            },
            calls: {
              getUserByMail: "GET /2021-08/user/${email}",
              createUser: "POST /2021-08/user",
              updateUser: "PUT /2021-08/user/${email}"
            }
        }    
      },            
      "/2021-08/git": {
          defaultRepository: "${GITHUB_REPOSITORY}",
          notifyTo: "UNF9ZMNJF",
          calls: {
              //notify: "GET /2021-08/slackbot/send?channel=${to}&message=${message}",
              environment: "GET /2021-08/gateway/info"
          },          
      },
      "/2021-08/pdf": {          
      },     
      "/2021-08/user": {
          //heartbeat:10000,
          db: "db",
          calls: {                          
          },
          backup: {
              key: "${AWS_KEY}",
              secret: "${AWS_PASSWORD}",              
              root: "db"
			},
			url: "/2021-08/auth/login?email=${email}&password=${psw}"
        },             
      "/2021-08/geographic": {
          calls: {
              states: "GET /2021-08/geographic/${country}/states",
              cities: "GET /2021-08/geographic/${country}/${state}/cities"
          }
      },             
      "/2021-08/static": {
          routes: [              
              {req:"/",dest:"proxy://localhost:8100"},              
          ]
        },
      "ui": {
            install: {
                git: "/secureMedHub_ui",
                branch: "main",
                location: "root://secureMedHub/_ui",
                after: `      
            npm i       
            ionic serve -p 8100
            `
            }
        },
  }
}
