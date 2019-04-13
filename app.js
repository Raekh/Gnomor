const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')

const Event = require('./models/event')

const app = express()

app.use(bodyParser.json())

app.use(
	'/graphql',
	graphqlHttp({
		schema    : buildSchema(`
		type Event {
			_id: ID!
			title: String!
			description: String!
			price: Float!
			date: String!
		} 

		input EventInput {
			title: String!
			description: String!
			price: Float!
			date: String!
		}

		type RootQuery {
			events: [Event!]!
		}

		type RootMutation {
			createEvent(eventInput: EventInput): Event
		}

		schema {
			query: RootQuery
			mutation: RootMutation 
		}
	`),
		rootValue : {
			events      : () => {
				return Event.find()
					.then((events) => {
						return events.map((event) => {
							return { ...event._doc }
						})
					})
					.catch((err) => {
						throw err
					})
			},
			createEvent : (args) => {
				let { title, description, price, date } = args.eventInput
				const event = new Event({
					title       : title,
					description : description,
					price       : +price,
					date        : new Date(date)
				})
				return event
					.save()
					.then((result) => {
						console.log(result)
						return { ...result._doc }
					})
					.catch((err) => {
						console.log(err)
						throw err
					})
			}
		},
		graphiql  : true
	})
)

mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@gnomor-txiah.azure.mongodb.net/${process
			.env.MONGO_DB}?retryWrites=true`
	)
	.then()
	.catch((err) => {
		console.log(err)
	})

app.listen(3000)
