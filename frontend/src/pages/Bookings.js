import React, { Component, Fragment } from 'react'

import AuthContext from '../context/auth-context'

import BookingList from '../components/Bookings/BookingList/BookingList'
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

	deleteBookingHandler = bookingId => {
		if (!this.context.token) {
			return
		}
		this.setState({ isLoading: true })

		const requestBody = {
			query     : `
			mutation CancelBooking($id: ID!){
				cancelBooking(bookingId: $id)
				{
					_id
					title
				}
			}
			`,
			variables : {
				id : bookingId
			}
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
				this.setState(prevState => {
					const updatedBookings = prevState.bookings.filter(b => {
						return b._id !== bookingId
					})
					return {
						bookings  : updatedBookings,
						isLoading : false
					}
				})
			})
			.catch(err => {
				console.log('%c error', 'color:red', err)
			})
	}

	render () {
		return (
			<Fragment>
				{this.state.isLoading ? (
					<Spinner />
				) : (
					<BookingList
						bookings={this.state.bookings}
						onDelete={this.deleteBookingHandler}
					/>
				)}
			</Fragment>
		)
	}
}

export default BookingsPage
