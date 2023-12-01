import React from 'react'
import BasicCardItem from './BasicCardItem'
import { AnalyticsManager, events } from '../api/Analytics'

export default class PlaceCellView extends React.Component { 
	getCost() { 
		if (this.props.place.cost === 0) { 
			return "Free"
		} else { 
			return "$" + this.props.place.cost
		}
	}

	onClick() { 
		AnalyticsManager.logEvent(events.USER_CLICKED_PLACE)
		this.props.onPress()
	}

	render() { 
		const { place } = this.props
		return <BasicCardItem
				image={place.image}
				title={place.name}
				subtitleOne={place.address}
				subtitleTwo={place.hours}
				mutedText={this.getCost()}
				onPress={() => this.onClick()}
		/>
	}
}