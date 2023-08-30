const bcrypt = require('bcrypt');
const saltRounds = 5;

module.exports={
	hash:(password)=>{return bcrypt.hashSync(password, saltRounds)},
	compare:(hash,password)=>{ return bcrypt.compareSync(password, hash)}
}