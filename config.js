const path = require('path')
const dotenv = require('dotenv').config()
const dotenvExample = require('dotenv').config({ path: path.resolve(process.cwd(), '.env.example') })

if (JSON.stringify(Object.keys(dotenv.parsed).sort()) !== JSON.stringify(Object.keys(dotenvExample.parsed).sort())) {
	throw Error('Missing values in .env. Please refer to .env.example')
}

module.exports = {
	port: process.env.PORT,
	mongodb: {
		connectionString: process.env.MONGO_CONNECTION_STRING,
	},
	environment: process.env.ENVIRONMENT
}
