const { Client } = require('pg')

function newClient(){
	const client = new Client({
		user: "postgres",
		host: "localhost",
		database: "rizky",
		password: "postgres",
		port: 5432,
	})
	return client
}

module.exports = newClient;