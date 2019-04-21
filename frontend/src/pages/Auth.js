import React, { Component } from 'react'

import './Auth.css'
import AuthContext from '../context/auth-context'

class AuthPage extends Component {
	// state = {
	// 	isLogin : true
	// }
	static contextType = AuthContext

	constructor (props) {
		super(props)
		this.emailEl = React.createRef()
		this.passwordEl = React.createRef()
		this.state = {
			isLogin : true
		}
		console.log('%c context', 'color:orange', this.context)
	}

	handleSwitch = () => {
		this.setState(prevState => {
			return {
				isLogin : !prevState.isLogin
			}
		})
	}

	submitHandler = e => {
		e.preventDefault()
		const email = this.emailEl.current.value
		const password = this.passwordEl.current.value

		if (email.trim().length === 0 || password.trim().length === 0) {
			return
		}
		let requestBody = {
			query     : `
			query Login($email: String!, $password: String!){
				login(email: $email, password: $password){
					userId
					token
					tokenExpiration
				}
			}
			`,
			variables : {
				email    : email,
				password : password
			}
		}

		if (!this.state.isLogin) {
			requestBody = {
				query     : `
					mutation CreateUser($email: String!, $password: String!){
						createUser(userInput: {
							email: $email
							password: $password     
						}){
							_id
							email
						}
					}
				`,
				variables : {
					email    : email,
					password : password
				}
			}
		}

		fetch('http://localhost:8000/graphql', {
			method  : 'POST',
			body    : JSON.stringify(requestBody),
			headers : {
				'Content-Type' : 'application/json'
			}
		})
			.then(res => {
				if (res.status !== 200 && res.status !== 201) {
					throw new Error('Failed')
				}
				return res.json()
			})
			.then(resData => {
				if (this.state.isLogin) {
					if (resData.data.login.token) {
						console.log('%c resdata', 'color:orange', resData.data.login)
						let { token, userId, tokenExpiration } = resData.data.login
						console.log('%c token', 'color:red', token)
						this.context.login(token, userId, tokenExpiration)
						console.log(this.context)
					}
				}
			})
			.catch(err => {
				console.log(err)
			})
	}

	render () {
		return (
			<form className="auth-form" onSubmit={this.submitHandler}>
				<div className="form-control">
					<label htmlFor="email">E-mail</label>
					<input type="email" id="email" ref={this.emailEl} />
				</div>
				<div className="form-control">
					<label htmlFor="password">Password</label>
					<input type="password" id="password" ref={this.passwordEl} />
				</div>
				<div className="form-actions">
					<button type="submit">Submit</button>
					<button type="button" onClick={this.handleSwitch}>
						Switch to {this.state.isLogin ? 'Signup' : 'Login'}
					</button>
				</div>
			</form>
		)
	}
}

export default AuthPage
