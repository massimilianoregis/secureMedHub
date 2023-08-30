var FacebookStrategy = require('passport-facebook').Strategy;
var passport = require('passport');

class FacebookLogin{
	static config(clientId,secret,calls){
		if(FacebookLogin._instance) return FacebookLogin._instance;

		FacebookLogin._instance= new FacebookLogin(clientId,secret,calls)
	}
	constructor(clientId,secret,callbackUrl,calls){
		this.clientId=clientId;
		this.secret=secret;

		passport.use('facebook',new FacebookStrategy({
		    clientID: clientId,
		    clientSecret: secret,
		    profileFields: ['id', 'emails', 'name'],
		    callbackURL: callbackUrl
		  },
		  async function(accessToken, refreshToken, profile, done) {  	
		  	var user =  {
		       	nick:profile.displayName,
		       	first_name:profile.name.givenName,
		       	last_name:profile.name.familyName,
		       	email:profile._json.email,
		       	confirmed:profile._json.email_verified,
				method:"facebook"
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
		FacebookLogin.config(config.clientId,config.secret,config.callback);
	})
	.app

app.use(passport.initialize());
app.get('/',passport.authenticate('facebook', { scope: ['read_stream','public_profile','email'] }));

app.get('/callback', passport.authenticate('facebook', { session: false, failureRedirect: "/login" }))
app.get('/callback',
	async (req, res)=>{		
		res.setJWT(req.user.jwt);
		res.redirect('/profile');
	});
module.exports=app;