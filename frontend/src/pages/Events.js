import React, { Component, Fragment } from 'react'
import Modal from '../components/Modal/Modal'
import Backdrop from '../components/Backdrop/Backdrop'

import './Events.css'
import AuthContext from '../context/auth-context'

class EventsPage extends Component {
	constructor (props) {
		super(props)
		this.state = {
			creating : false,
			events   : []
		}
		this.titleEl = React.createRef()
		this.priceEl = React.createRef()
		this.dateEl = React.createRef()
		this.descriptionEl = React.createRef()
	}

	componentDidMount () {
		this.fetchEvents()
	}

	fetchEvents = () => {
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
				this.setState({ events: events })
			})
			.catch(err => {
				console.log(err)
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

		if (title.trim().length === 0 || price < 0 || date.trim().length === 0 || description.trim().length === 0) {
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
			query : `
			mutation {
				createEvent(eventInput: {
					title: "${title}",
					description: "${description}",
					price: ${price},
					date: "${date}"
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
			`
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
				console.log(resData)
				this.fetchEvents()
			})
			.catch(err => {
				console.log(err)
			})
	}

	modalCancelHandler = () => {
		this.setState({ creating: false })
	}

	render () {
		return (
			<Fragment>
				{this.state.creating && <Backdrop />}
				{this.state.creating && (
					<Modal
						title="Add Event"
						canCancel
						canConfirm
						onCancel={this.modalCancelHandler}
						onConfirm={this.modalConfirmHandler}
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
				{this.context.token && (
					<div className="events-control">
						<p>Share your own Events !</p>
						<button className="btn" onClick={this.startCreateEventHandler}>
							Create Event
						</button>
					</div>
				)}
				<ul className="events__list">
					{this.state.events.map((event, key) => {
						return (
							<li key={key} className="events__list-item">
								{event.title} - <em>{event.description}</em>
							</li>
						)
					})}
					{this.state.events.length === 0 && <li className="events__list-item">No events.</li>}
				</ul>
			</Fragment>
		)
	}
}

export default EventsPage
