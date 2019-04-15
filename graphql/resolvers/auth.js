const bcrypt = require('bcryptjs')

const User = require('../../models/user')

const { transformUser } = require('./merge')

module.exports = {
	users      : async () => {
		try {
			const users = await User.find()
			return users.map(user => {
				return transformUser(user)
			})
		} catch (err) {
			throw err
		}
	},
	createUser : async args => {
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
			return transformUser(user)
		} catch (err) {
			throw err
		}
	}
}
