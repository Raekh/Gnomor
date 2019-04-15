const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
	},
	login      : async args => {
		let { email, password } = args
		const user = await User.findOne({ email: email })
		if (!user) {
			throw new Error('Invalid credentials - #1')
		}
		const isEqual = await bcrypt.compare(password, user.password)
		if (!isEqual) {
			throw new Error('Invalid credentials - #2')
		}
		const token = jwt.sign(
			{
				userId : user.id,
				email  : user.email
			},
			'somesupersecretkey',
			{
				expiresIn : '1h'
			}
		)
		return {
			userId          : user.id,
			token           : token,
			tokenExpiration : 1
		}
	}
}
