import React, { Component, Fragment } from 'react'
import Modal from '../components/Modal/Modal'
import Backdrop from '../components/Backdrop/Backdrop'
import Spinner from '../components/Spinner/Spinner'
import EventList from '../components/Events/EventList/EventList'
import './Events.css'
import AuthContext from '../context/auth-context'

class EventsPage extends Component {
	constructor (props) {
		super(props)
		this.state = {
			creating      : false,
			events        : [],
			isLoading     : false,
			selectedEvent : null
		}
		this.titleEl = React.createRef()
		this.priceEl = React.createRef()
		this.dateEl = React.createRef()
		this.descriptionEl = React.createRef()
	}

	isActive = true

	componentDidMount () {
		this.fetchEvents()
	}

	fetchEvents = () => {
		this.setState({ isLoading: true })
		const requestBody = {
			query : `
			{
				events
				{
					_id
					title
					description
					date
					price
					creator{
						_id
						email
					}
				}
			}
			`
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
				console.log(resData)
				const events = resData.data.events
				this.setState({
					events    : events,
					isLoading : false
				})
			})
			.catch(err => {
				console.log(err)
				this.setState({ isLoading: false })
			})
	}

	static contextType = AuthContext

	startCreateEventHandler = () => {
		this.setState({ creating: true })
	}

	modalConfirmHandler = () => {
		this.setState({
			creating : false
		})
		const title = this.titleEl.current.value
		const date = this.dateEl.current.value
		const price = +this.priceEl.current.value
		const description = this.descriptionEl.current.value

		if (
			title.trim().length === 0 ||
			price < 0 ||
			date.trim().length === 0 ||
			description.trim().length === 0
		) {
			return
		}

		const event = {
			title,
			description,
			price,
			date
		}
		console.log(event)

		const requestBody = {
			query     : `
			mutation CreateEvent(
				$title: String!, 
				$description: String!,
				$price: Float!, 
				$date: String!
				){
				createEvent(eventInput: {
					title: $title,
					description: $description,
					price:$price,
					date: $date
				})
				{
					_id
					title
					description
					date
					price
					creator{
						_id
						email
					}
				}
			}
			`,
			variables : {
				title       : title,
				description : description,
				price       : price,
				date        : date
			}
		}

		console.log(requestBody)

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
				if (this.isActive) {
					this.setState(prevState => {
						const updatedEvents = [ ...prevState.events ]
						console.log('%c updatedEvents', 'color:red', updatedEvents)
						let { _id, title, description, date, price } = resData.data.createEvent
						updatedEvents.push({
							_id         : _id,
							title,
							description,
							date,
							price,
							creator     : {
								_id : this.context.userId
							}
						})
						console.log('%c updatedEvents', 'color:green', updatedEvents)
						return { events: updatedEvents }
					})
				}
			})
			.catch(err => {
				console.log(err)
			})
	}

	modalCancelHandler = () => {
		this.setState({
			creating      : false,
			selectedEvent : null
		})
	}

	showDetailHandler = eventId => {
		this.setState(prevState => {
			const selectedEvent = prevState.events.find(e => e._id === eventId)
			return {
				selectedEvent : selectedEvent
			}
		})
	}

	bookEventHandler = () => {
		if (!this.context.token) {
			this.setState({ selectedEvent: null })
			return
		}

		const requestBody = {
			query     : `
			mutation BookEvent($id: ID!){
				bookEvent(eventId: $id)
				{
					createdAt
					updatedAt
				}
			}
			`,
			variables : {
				id : this.state.selectedEvent._id
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
				if (this.isActive) {
					console.log(resData)
					this.setState({ selectedEvent: null })
				}
			})
			.catch(err => {
				console.log(err)
			})
	}

	componentWillUnmount () {
		this.isActive = false
	}

	render () {
		return (
			<Fragment>
				{(this.state.creating || this.state.selectedEvent) && <Backdrop />}
				{this.state.creating && (
					<Modal
						title="Add Event"
						canCancel
						canConfirm
						onCancel={this.modalCancelHandler}
						onConfirm={this.modalConfirmHandler}
						confirmText="Confirm"
					>
						<form>
							<div className="form-control">
								<label htmlFor="title">Title</label>
								<input type="text" id="title" ref={this.titleEl} />
							</div>
							<div className="form-control">
								<label htmlFor="price">Price</label>
								<input type="Number" id="price" ref={this.priceEl} />
							</div>
							<div className="form-control">
								<label htmlFor="date">Date</label>
								<input type="datetime-local" id="date" ref={this.dateEl} />
							</div>
							<div className="form-control">
								<label htmlFor="description">Description</label>
								<textarea id="description" ref={this.descriptionEl} rows="4" />
							</div>
						</form>
					</Modal>
				)}
				{this.state.selectedEvent && (
					<Modal
						title={this.state.selectedEvent.title}
						canCancel
						canConfirm
						onCancel={this.modalCancelHandler}
						onConfirm={this.bookEventHandler}
						confirmText={this.context.token ? 'Book' : 'Confirm'}
					>
						<h1>{this.state.selectedEvent.title}</h1>
						<h2>
							{this.state.selectedEvent.price} -{' '}
							{new Date(this.state.selectedEvent.date).toLocaleDateString()}
						</h2>
						<p>{this.state.selectedEvent.description}</p>
					</Modal>
				)}
				{this.context.token && (
					<div className="events-control">
						<p>Share your own Events !</p>
						<button className="btn" onClick={this.startCreateEventHandler}>
							Create Event
						</button>
					</div>
				)}
				{this.state.isLoading ? (
					<Spinner />
				) : (
					<EventList
						events={this.state.events}
						authUserId={this.context.userId}
						onViewDetail={this.showDetailHandler}
					/>
				)}
			</Fragment>
		)
	}
}

export default EventsPage
