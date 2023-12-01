import { Spinner } from 'native-base';
import React from 'react'
import { View, Text } from 'react-native'
import EventAPI from '../api/EventAPI';
import EventListView from '../components/EventListView'
import VideoPlayer from '../components/VideoPlayer'
import InternalConfig from '../constants/InternalConfig';
import StylerInstance from '../managers/BaseStyler';


export default class MyEventsScreen extends React.Component { 
	

	constructor(props) { 
		super(props)
		this.state = {
			loading: false, 
			videoUrl: '', 
			modalVisible: false,
			organizerEvents: [],
			refresh: false
		}
		this.eventApi = new EventAPI();
	}

	async componentDidMount() { 
		console.log("===========MY EVENT DID MOUNT==============")
		var events = this.props.route.params.organizerEvents || null
		console.log(events)
		events = await this.eventApi.getOrganizerEvents();
		if (!events || events.code === -1) { 
			Alert.alert("Failed to fetch events. Please try again later")
		}

		
		this.setState({organizerEvents: events, refreshed: !this.state.refreshed})
	}

	handleVideoClick(video) { 
		this.setState({videoUrl: video.url, modalVisible: true})
	} 

	render() { 
		//TODO: Use flat list rather than section list.
		if (this.state.loading == true) { 
			<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<Spinner />
			</View>
		}

		return (
			<View style={{backgroundColor: StylerInstance.getBackgroundColor()}}>
				<EventListView
					events={this.state.organizerEvents}
					onEventClicked={(data) => this.props.navigation.navigate("Organize", {event: data})}
					onVideoClick={(video) => this.handleVideoClick(video)}
					extraData={this.state.refreshed}
				/>
			<VideoPlayer
					visible={this.state.modalVisible}
					videoUrl={this.state.videoUrl}
					onExitClick={() => this.setState({modalVisible: false})}
				/>
				</View>
			)

	}
}