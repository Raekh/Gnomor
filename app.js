const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const mongoose = require('mongoose')

const graphQlSchema = require('./graphql/schema/index')
const graphQlResolvers = require('./graphql/resolvers/index')
const isAuth = require('./middleware/is-auth')

const app = express()

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Access-Control-Allow-Origin')
	res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200)
	} else {
		next()
	}
})

app.use(bodyParser.json())

app.use(isAuth)

app.use(
	'/graphql',
	graphqlHttp({
		schema    : graphQlSchema,
		rootValue : graphQlResolvers,
		graphiql  : true
	})
)

mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@gnomor-txiah.azure.mongodb.net/${process
			.env.MONGO_DB}?retryWrites=true`
	)
	.then(() => {
		app.listen(8000)
	})
	.catch(err => {
		console.log(err)
	})
