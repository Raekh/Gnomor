import React, { Component, Fragment } from 'react'

import AuthContext from '../context/auth-context'
import Spinner from '../components/Spinner/Spinner'

class BookingsPage extends Component {
	constructor (props) {
		super(props)
		this.state = {
			isLoading : false,
			bookings  : []
		}
	}

	static contextType = AuthContext

	componentDidMount = () => {
		this.fetchBookings()
	}

	fetchBookings = () => {
		if (!this.context.token) {
			return
		}

		this.setState({ isLoading: true })

		const requestBody = {
			query : `
		    {
				bookings
				{
					_id
					createdAt
					event{
						_id
						title
						date
					}
				}
			}
			`
		}

		fetch('http://localhost:8000/graphql', {
			method  : 'POST',
			body    : JSON.stringify(requestBody),
			headers : {
				'Content-Type' : 'application/json',
				Authorization  : `Bearer ${this.context.token}`
			}
		})
			.then(res => {
				if (res.status !== 200 && res.status !== 201) {
					throw new Error('Failed')
				}
				return res.json()
			})
			.then(resData => {
				const bookings = resData.data.bookings
				this.setState({
					isLoading     : false,
					bookings      : bookings,
					selectedEvent : null
				})
			})
			.catch(err => {
				console.log(err)
			})
	}
	render () {
		return (
			<Fragment>
				{this.state.isLoading ? (
					<Spinner />
				) : (
					<ul>
						{this.state.bookings.map(booking => (
							<li key={booking._id}>
								{booking.event.title} -{' '}
								{new Date(booking.createdAt).toLocaleDateString()}
							</li>
						))}
					</ul>
				)}
			</Fragment>
		)
	}
}

export default BookingsPage
