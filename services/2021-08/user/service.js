var {Document} =require("service-libs");
var crypt= require("./crypt");

class User extends Document{
	//static get defaultLib() {return __dirname;}
	
	static get dbName(){return "users.nedb";}
	static async get(search){	
		var user = await super.get(search);
		if(!user) return await super.get({email:search.id});
		return user;
	}
	
	set password(value)	{
		if(this.action=="load")
			this._password=value;
		else
			this._password=crypt.hash(value);
		
		this.passwordChange = false
	}	
	get password()		{return this._password;}	
	set visible(value)	{this.hidden=!value;}
	get visible()		{return this._hidden?false:true;}

	get isFakeMail()	{return this._email&&this._email.match("fake.com");}
	get email()			{
		if(this.isFakeMail) return null;
		return this._email;
	}
	set email(value){
		this._email=value
	}
	async addRole(name){
		this.roles=this.roles||[];		
		if(!this.roles.find(role=>role.name==name)){						
			this.roles.push({name:name})			
			await this.save();
		}
	}
	async newAccess(id){
		await this.db.update({id:id},{$set:{last_login:new Date()}});
	}
	

	toJSONDB(){
		this.created=this.created||new Date()
		this.updated_at= new Date();
		return {
			id: 			this.id,
			old_id:  		this.old_id,
			first_name: 	this.first_name,
			last_name: 		this.last_name,
			nick:  			this.nick,
			email: 			this._email.toLowerCase(),
			phone_number: 	this.phone_number,
			password: 		this.password,	
			passwordChange: this.passwordChange,		
			last_login: 	this.last_login,
			roles: 			this.roles,
			confirmed: 		this.confirmed,
			hidden: 		this.hidden,
			note: 			this.note,
			vet:			this.vet,
			groups:         this.groups,
			passwordChange: this.passwordChange,
			preferences:    this.preferences,
			created: 		this.created||this.creation_time,
			updated_at: 	this.updated_at||this.updated_time,
			social_login:   this.social_login
		}
	}
	toJSON(){
		/**
		 * A User output
		 * @typedef {object} User
		 * @property {string} id.required.uuid - uuid,
		 * @property {string} first_name - first_name
		 * @property {string} last_name -  last_name
		 * @property {string} nick -       nick: no used
		 * @property {string} email -      email
		 * @property {string} handle -     handle: no used but the purpose is a way to fast referce
		 * @property {string} phone_number - phone_number,
		 * @property {string} created -    created,
		 * @property {string} updated_at - updated_at,
		 * @property {string} last_login - last_login,
		 * @property {array<Role>} roles -      roles,
		 * @property {array<object>} preferences   
		 * @property {array<object>} social_login
		 
		*/
		return {
			id: 			this.id,
			old_id:  		this.old_id,
			first_name: 	this.first_name,
			last_name: 		this.last_name,
			nick:  			this.nick,
			email: 			this.email,
			handle: 		this.email,
			phone_number: 	this.phone_number,
			created: 		this.created||this.creation_time,				
			updated_at: 	this.updated_at||this.updated_time,
			last_login: 	this.last_login,				
			confirmed: 		this.confirmed,
			roles: 			this.roles,			
			warning: 		this.cleanup,
			groups:         this.groups, 
			note: 			this.note,
			vet:			this.vet,
			visible: 		this.visible?true:false,			
			creation_time:	this.creation_time,
			creation_by: 	this.creation_by,
			updated_time:	this.updated_time,
			updated_by: 	this.updated_by,
			passwordChange: this.passwordChange,
			preferences:    this.preferences,
			organizations:this.organizations,
			password: 		this.password,
			social_login:   this.social_login
		};
	}
}

module.exports=User;