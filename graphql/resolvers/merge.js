const Event = require('../../models/event')
const User = require('../../models/user')
const Booking = require('../../models/booking')

const { dateToString } = require('../../helpers/date')

const transformUser = user => {
	return {
		...user._doc,
		password      : null,
		createdEvents : events.bind(this, user._doc.createdEvents)
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
	const event = await Event.find({ _id: { $in: eventIds } })
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
		const event = await Event.findById(eventId)
		return transformEvent(event)
	} catch (err) {
		throw err
	}
}

const user = async userId => {
	const user = await User.findById(userId)
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
