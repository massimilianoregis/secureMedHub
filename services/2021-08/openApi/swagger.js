const expressJSDocSwagger = require('express-jsdoc-swagger');

const options = {
    info: {
      version: '1.0.0',
      title: 'Gateway',
      license: {
        name: 'MIT',
      },
    }, 
    security: {    
      AdminAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: "JWT"
      },  
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: "JWT"
      }
    },
    baseDir: __dirname,
    filesPattern: ['../../**/*.openApi','../../**/*.js'],
    swaggerUIPath: '/api-docs',
    exposeSwaggerUI: true,
    exposeApiDocs: true,
    apiDocsPath: '/v3/api-docs',    
    notRequiredAsNullable: false,
    servers: [
      
    ]
  };
  module.exports=(app)=>expressJSDocSwagger(app)(options);