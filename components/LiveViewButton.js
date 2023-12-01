import React from 'react'
import moment from 'moment'
import * as Animatable from 'react-native-animatable';
import { AnalyticsManager, events } from '../api/Analytics'
import {Linking, View } from 'react-native'
import { Button, Text } from 'native-base'

export default class LiveViewButton extends React.Component { 
	constructor(props) { 
		super(props)
	}

	onClick(location) { 
		AnalyticsManager.logEvent(events.USER_CLICKED_LIVE_VIEW)
		Linking.openURL(location)
	}

	render() { 
		const location = this.props.event.live_location
		const isLive = moment(this.props.event.start_date).isBefore(moment.now()) && moment(this.props.event.end_date).isAfter(moment.now())

		const eventNotOver = moment(this.props.event.end_date).isAfter(moment.now())

		if (isLive === true && location !== undefined && location !== null && location !== '') { 
			return (
				<View style={{flexDirection: 'row', marginTop: 10}}>
				<Button variant="subtle" colorScheme={"danger"} style={{width:'80%', maxHeight: 35}}
				onPress={() => this.onClick(location)}>
				Live Stories
				</Button></View>)
		} 

		const timeTilEvent = moment(this.props.event.start_date).toNow('hh')
		if (this.props.event.live_location !== undefined && this.props.event.live_location !== null 
			&& this.props.event.live_location !== '' && eventNotOver) { 
				return (
				<View style={{marginTop: 10}}>
				<Button variant="subtle" colorScheme={"danger"} style={{ maxHeight:35}}
				onPress={() => console.log("Not yet.")}>Live Stories starts in {timeTilEvent}
				</Button></View>)
		}

		return null
	}
}