const Booking = require('../../models/booking')
const Event = require('../../models/event')

const { transformBooking, transformEvent } = require('./merge')

module.exports = {
	bookings      : async () => {
		try {
			const bookings = await Booking.find()
			return bookings.map(booking => {
				return transformBooking(booking)
			})
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
		return transformBooking(result)
	},
	cancelBooking : async args => {
		try {
			let { bookingId } = args
			const booking = await Booking.find(bookingId).populate('event')
			const event = transformEvent(booking.event)
			await Booking.deleteOne({ _id: bookingId })
			return event
		} catch (err) {
			throw err
		}
	}
}
