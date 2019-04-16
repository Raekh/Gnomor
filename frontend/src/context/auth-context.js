import React from 'react'

export default React.createContext({
	token           : null,
	userId          : null,
	tokenExpiration : null,
	login           : (token, userId, tokenExpiration) => {
		console.log('LOGGING')
		this.token = token
		this.userId = userId
		this.tokenExpiration = tokenExpiration
	},
	logout          : () => {
		this.token = null
		this.userId = null
		this.tokenExpiration = null
	}
})
