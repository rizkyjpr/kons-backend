const { Client } = require('pg')

function newClient(){
	const client = new Client({
		user: process.env.DB_USER,
		host: process.env.HOST,
		database: process.env.DATABASE,
		password: process.env.PASSWORD,
		port: process.env.DB_PORT,
	})
	return client
}

module.exports = newClient;