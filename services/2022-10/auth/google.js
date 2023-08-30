var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var passport = require('passport');

class GoogleLogin{
	static config(clientId,secret,callbackUrl){
		if(GoogleLogin._instance) return GoogleLogin._instance;

		GoogleLogin._instance= new GoogleLogin(clientId,secret,callbackUrl)
	}

	constructor(clientId,secret,callback){
		this.clientId=clientId;
		this.secret=secret;
		passport.use('google',new GoogleStrategy({
		    clientID: clientId,
		    clientSecret: secret,
		    callbackURL: callback   
		  },
		  async function(accessToken, refreshToken, profile, done) {  			  	
		  	var user =  {
		       	nick:profile._json.name,
		       	first_name:profile._json.given_name,
		       	last_name:profile._json.family_name,
		       	email:profile._json.email,
		       	confirmed:profile._json.email_verified,
				method:"google"
		       }
		  	user = await app.services.logged(user)
		    return done(null,user);
		  }
		));
	}

}


const {Service} = require("service-libs");
const app= new Service()
	.addInfo()
	.addDefaultConfig(config=>{		

		GoogleLogin.config(config.clientId,config.secret,config.callback);
	})
	.app

app.use(passport.initialize());
app.get('/',passport.authenticate('google', { scope: ['profile',"email"] }));
app.get('/callback', passport.authenticate('google', { session: false, failureRedirect: "/login" }));
app.get('/callback', (req, res)=>{
	res.setJWT(req.user.jwt);
	res.redirect('/profile');
})
module.exports=app;
