const Event = require('../../models/event')

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
	createEvent : async args => {
		let { title, description, price, date } = args.eventInput
		const event = new Event({
			title       : title,
			description : description,
			price       : +price,
			date        : dateToString(date),
			creator     : '5cb382f4ca6e9e3b1840926c'
		})
		let createdEvent
		try {
			const result = await event.save()
			createdEvent = transformEvent(result)
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
	}
}
