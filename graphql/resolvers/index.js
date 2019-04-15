const bcrypt = require('bcryptjs')

const Event = require('../../models/event')
const User = require('../../models/user')

const events = async (eventIds) => {
	const event = await Event.find({ _id: { $in: eventIds } })
	try {
		return events.map((event) => {
			return {
				...event._doc,
				date    : new Date(event._doc.date).toISOString(),
				creator : user.bind(this, event._doc.creator)
			}
		})
	} catch (err) {
		throw err
	}
}

const user = async (userId) => {
	const user = await User.findById(userId)
	try {
		return {
			...user._doc,
			createdEvents : events.bind(this, user._doc.createdEvents)
		}
	} catch (err) {
		throw err
	}
}

module.exports = {
	events      : async () => {
		try {
			const events = await Event.find()
			return events.map((event) => {
				return {
					...event._doc,
					date    : new Date(event._doc.date).toISOString(),
					creator : user.bind(this, event.creator)
				}
			})
		} catch (err) {
			throw err
		}
	},
	users       : () => {
		return User.find()
			.then((users) => {
				return users.map((user) => {
					return {
						...user._doc,
						createdEvents : events.bind(this, user.createdEvents)
					}
				})
			})
			.catch((err) => {
				throw err
			})
	},
	createEvent : async (args) => {
		let { title, description, price, date } = args.eventInput
		const event = new Event({
			title       : title,
			description : description,
			price       : +price,
			date        : new Date(date),
			creator     : '5cb382f4ca6e9e3b1840926c'
		})
		let createdEvent
		try {
			const result = await event.save()
			createdEvent = {
				...result._doc,
				date    : new Date(event._doc.date).toISOString(),
				creator : user.bind(this, result.creator)
			}
			const creator = await User.findById('5cb382f4ca6e9e3b1840926c')

			if (!creator) {
				throw new Error('User not found')
			}
			creator.createdEvent.push(event)
			await creator.save()
			return createdEvent
		} catch (err) {
			throw err
		}
	},
	createUser  : async (args) => {
		let { email, password } = args.userInput
		try {
			const existingUser = await User.findOne({ email: email })
			if (existingUser) {
				throw new Error('User exists already')
			}
			const hash = await bcrypt.hash(password, 12)
			const user = new User({
				email    : email,
				password : hash
			})
			const result = await user.save()
			return { ...result._doc, password: null }
		} catch (err) {
			throw err
		}
	}
}
