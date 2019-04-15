const bcrypt = require('bcryptjs')

const Event = require('../../models/event')
const User = require('../../models/user')
const Booking = require('../../models/booking')

const events = async eventIds => {
	const event = await Event.find({ _id: { $in: eventIds } })
	try {
		return events.map(event => {
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

const singleEvent = async eventId => {
	try {
		const event = await Event.findById(eventId)
		return {
			...event._doc,
			creator : user.bind(this, event.creator)
		}
	} catch (err) {
		throw err
	}
}

const user = async userId => {
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
	events        : async () => {
		try {
			const events = await Event.find()
			return events.map(event => {
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
	users         : async () => {
		try {
			const users = await User.find()
			return users.map(user => {
				return {
					...user._doc,
					createdEvents : events.bind(this, user.createdEvents)
				}
			})
		} catch (err) {
			throw err
		}
	},
	bookings      : async () => {
		try {
			const bookings = await Booking.find()
			return bookings.map(booking => {
				return {
					...booking._doc,
					user      : user.bind(this, booking._doc.user),
					event     : singleEvent.bind(this, booking._doc.event),
					createdAt : new Date(booking._doc.createdAt).toISOString(),
					updatedAt : new Date(booking._doc.updatedAt).toISOString()
				}
			})
		} catch (err) {
			throw err
		}
	},
	createEvent   : async args => {
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
	createUser    : async args => {
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
	},
	bookEvent     : async args => {
		let { eventId } = args
		const fetchedEvent = await Event.findOne({ _id: eventId })
		const booking = new Booking({
			user  : '',
			event : fetchedEvent
		})
		const result = await booking.save()
		return {
			...result._doc,
			user      : user.bind(this, booking._doc.user),
			event     : singleEvent.bind(this, booking._doc.event),
			createdAt : new Date(result._doc.createdAt).toISOString(),
			updatedAt : new Date(result._doc.updatedAt).toISOString()
		}
	},
	cancelBooking : async args => {
		try {
			let { bookingId } = args
			const booking = await Booking.find(bookingId).populate('event')
			const event = {
				...booking.event._doc,
				creator : user.bind(this, booking.event._doc.creator)
			}
			await Booking.deleteOne({ _id: bookingId })
			return event
		} catch (err) {
			throw err
		}
	}
}
