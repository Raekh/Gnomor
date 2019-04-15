const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Event = require('./models/event')
const User = require('./models/user')

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

		type User {
			_id: ID!
			email: String!
			password: String
		}

		input EventInput {
			title: String!
			description: String!
			price: Float!
			date: String!
		}

		input UserInput{
			email: String!
			password: String!
		}

		type RootQuery {
			events: [Event!]!
		}

		type RootMutation {
			createEvent(eventInput: EventInput): Event
			createUser(userInput: UserInput): User
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
			users       : () => {
				return User.find()
					.then((users) => {
						return users.map((user) => {
							return { ...user._doc }
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
					date        : new Date(date),
					creator     : '5cb382f4ca6e9e3b1840926c'
				})
				let createdEvent
				return event
					.save()
					.then((result) => {
						createdEvent = { ...result._doc }
						return User.findById('5cb382f4ca6e9e3b1840926c')
					})
					.then((user) => {
						if (!user) {
							throw new Error('User not found')
						}
						user.cretaedEvents.push(event)
						return user.save()
					})
					.then(() => {
						return createdEvent
					})
					.catch((err) => {
						console.log(err)
						throw err
					})
			},
			createUser  : (args) => {
				let { email, password } = args.userInput
				User.findOne({ email: email })
					.then((user) => {
						if (user) {
							throw new Error('User exists already')
						}
						return bcrypt.hash(password, 12)
					})
					.then((hash) => {
						const user = new User({
							email    : email,
							password : hash
						})
						return user.save()
					})
					.then((result) => {
						return { ...result._doc, password: null }
					})
					.catch((err) => {
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
