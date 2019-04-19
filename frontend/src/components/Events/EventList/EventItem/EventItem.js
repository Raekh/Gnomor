import React from 'react'

import './EventItem.css'

const eventItem = props => (
	<li key={props.eventId} className="event__list-item">
		<div>
			<h1>{props.title}</h1>
			<h2>$19.99</h2>
		</div>
		<div>
			{props.userId !== props.creatorId ? (
				<button className="btn">View Details</button>
			) : (
				<p>You are the creator of this event.</p>
			)}
		</div>
	</li>
)

export default eventItem
