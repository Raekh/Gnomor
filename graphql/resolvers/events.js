const Event = require('../../models/event')
const User = require('../../models/user')

const { transformEvent } = require('./merge')

module.exports = {
	events      : async () => {
		try {
			const events = await Event.find()
			return events.map(event => {
				return transformEvent(event)
			})
		} catch (err) {
			throw err
		}
	},
	createEvent : async (args, req) => {
		if (!req.isAuth) {
			throw new Error('Unauthenticated')
		}
		let { title, description, price, date } = args.eventInput
		const event = new Event({
			title       : title,
			description : description,
			price       : +price,
			date        : dateToString(date),
			creator     : req.userId
		})
		let createdEvent
		try {
			const result = await event.save()
			createdEvent = transformEvent(result)
			const creator = await User.findById(req.userId)

			if (!creator) {
				throw new Error('User not found')
			}
			creator.createdEvent.push(event)
			await creator.save()
			return createdEvent
		} catch (err) {
			throw err
		}
	}
}
