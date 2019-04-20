const Event = require('../../models/event')
const User = require('../../models/user')
const Booking = require('../../models/booking')
const DataLoader = require('dataloader')

const { dateToString } = require('../../helpers/date')

const eventLoader = new DataLoader(eventIds => {
	return events(eventIds)
})

const userLoader = new DataLoader(eventIds => {
	return User.find({ _id: { $in: eventIds } })
})

const transformUser = user => {
	return {
		...user._doc,
		password      : null,
		createdEvents : () => eventLoader.loadMany.bind(this, user._doc.createdEvents)
	}
}

const transformEvent = event => {
	return {
		...event._doc,
		date    : dateToString(event._doc.date),
		creator : user.bind(this, event.creator)
	}
}

const transformBooking = booking => {
	return {
		...booking._doc,
		user      : user.bind(this, booking._doc.user),
		event     : singleEvent.bind(this, booking._doc.event),
		createdAt : dateToString(booking._doc.createdAt),
		updatedAt : dateToString(booking._doc.updatedAt)
	}
}

const events = async eventIds => {
	const events = await Event.find({ _id: { $in: eventIds } })
	try {
		return events.map(event => {
			return transformEvent(event)
		})
	} catch (err) {
		throw err
	}
}

const singleEvent = async eventId => {
	try {
		const event = await eventLoader.load(eventId.toString())
		return event
	} catch (err) {
		throw err
	}
}

const user = async userId => {
	const user = await userLoader.load(userId.toString())
	try {
		return transformUser(user)
	} catch (err) {
		throw err
	}
}

// exports.user = user
// exports.events = events
// exports.singleEvent = singleEvent

exports.transformBooking = transformBooking
exports.transformEvent = transformEvent
exports.transformUser = transformUser
exports.dateToString = dateToString
