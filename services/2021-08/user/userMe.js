const { request } = require("https");
const moment = require("moment-timezone")
/** 
 * A Role
 * @typedef {object} Role
 * @property {string}  name
*/

/**
   * A User Me output
   * @typedef {object} UserMe
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
class UserMe{
    constructor(user){
        this.user=user;     
    }
    static async create(user,gateway){        
        UserMe.gateway=gateway;    
        var obj = new UserMe(user);
            await obj.load();
        return obj;
    }
    async load(){
        const {user} = this;        
    }
    
    toJSON(){
        const {user} = this;
        return {
            id:         user.id,
            first_name: user.first_name,
            last_name:  user.last_name,
            nick:       user.nick,
            email:      user.email,
            handle:     user.handle,
            phone_number:user.phone_number,
            created:    user.created,
            updated_at: user.updated_at,
            last_login: user.last_login,
            roles:      user.roles,                
            preferences:user.preferences,
            social_login: user.social_login
        }
    }
}


module.exports=UserMe;
