const bcrypt = require("bcryptjs");
const newClient = require("../connection");

const register = async (user) =>{
	return new Promise(async (resolve, reject) => {
		const hashedPassword = await bcrypt.hash(user.password, 15)
		const client = newClient();
		client.connect();
		client.query(`INSERT INTO public."user"(name, password, email)
					VALUES('${user.name}','${hashedPassword}','${user.email}')`,
					async err => {
						if(err) reject(err.message)
						resolve({message:"register-success"})
						client.end()
					})
	})
}

const login = async (user) => {
    return new Promise(async (resolve,reject) => {
        const client = newClient();
	    client.connect();
	    client.query(`SELECT * FROM public.user WHERE email='${user.email}'`, async (err,result)=>{
			if(err) reject(err)
		if (!result) {
			reject({message:"email-not-found"})
		}
		const match = await bcrypt.compareSync(user.password, result.rows[0].password)
        if (match) {
			resolve({name:result.rows[0].name})
		}
        reject({message:"incorrect-password"})
        client.end();
	    })
    })
}

module.exports = {
    register,
    login
}