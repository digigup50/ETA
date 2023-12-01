import { View, FlatList, Alert, Share} from 'react-native';
import * as Linking from 'expo-linking'
import React, { Component } from 'react';
import { Button, Spinner, Heading, HStack, Icon } from 'native-base';
import CommentAPI from '../api/CommentAPI';
import EventAPI from '../api/EventAPI'
import { AnalyticsManager, events } from '../api/Analytics';
import EventDetailView from '../components/EventDetailView'
import CommentList from '../components/CommentList'
import VideoListView from '../components/VideoListView'
import TypeBar from '../components/TypeBar'
import VideoPlayer from '../components/VideoPlayer'
import * as WebBrowser from 'expo-web-browser';
import { Feather, Entypo, Ionicons } from '@expo/vector-icons'
import EventTelemetryOverlay from '../components/EventTelemetryOverlay'
import { getZoneSlug, handleDMClick } from '../managers/UtilsManager'
import Section from '../components/Section'
import UserProfilePopup from '../components/UserProfilePopup'
import { connect } from 'react-redux'
import StylerInstance from '../managers/BaseStyler'
import Colors from '../constants/Colors';
import { createStartDM } from '../managers/UtilsManager';
class EventScreen extends Component { 
	 

	constructor(props) { 
		super(props)
		this.state = { 
			loading: true,
			event: null,
			refreshed: false,
			dummy : [{key: "x"}, {key: "a"}, {key : "y"}, {"key": "z"}, {"key": "b"}],	
			comments: null, 
			modalVisible: false, 
			videoUrl: null, 
			similarEvents: [], 
			popUser: null
		}
		this.flatRef = React.createRef();
		this.commentAPI =  new CommentAPI(),
		this.eventAPI = new EventAPI()
	}

	shareClick(event) { 
		AnalyticsManager.logEvent(events.USER_SHARED_EVENT, {event_kind: event.kind})
		if (event !== undefined && event !== null) {
			url = "Check out this event on ETA.\nhttps://www.witheta.com/event/" + event.id +"?aff=front_page&type=share&username=" + this.props.user.username 
			Share.share({
				message: url
			})
		}
	}


	async prepEvent(event) { 
		if (!this.state) { return; }
		this.setState({event: event, refreshed: !this.state.refreshed})
		const eventBody = { event_kind: event.kind }
		const source = this.props.route.params.source || null
		if (source !== null) { 
			eventBody.source = source
		}
		AnalyticsManager.logEvent(events.USER_VIEWED_EVENT_DETAIL, eventBody)
		
		weak = this
		weak.props.navigation.setParams({shareClick: () => this.shareClick(event)})
		weak.props.navigation.setOptions({'headerTransparent': true})
		console.log('called')
		if (event.comments === undefined) { 
			const commentsResp = await this.commentAPI.getComments(event.id);
			if (commentsResp && commentsResp.code !== -1) { 
				this.setState({ comments: commentsResp, refreshed: !this.state.refreshed})
			} else { 
				Alert.alert("Something went wrong", 
				"Sorry, we couldn't load event comments");
			}
		} else { 
			this.setState({comments: event.comments})
		}
	}

	componentDidMount() {
		const event = this.props.route.params.event ||null;
		const eventId = this.props.route.params.eventId || null;

		this.logEventView(eventId)
		
		if (event !== null) { 
			this.setState({event: event, loading: false, comments: event.comments})
			this.fetchAndPrepEvent(event.id)
		}

		if (eventId !== null) { 
			this.fetchAndPrepEvent(eventId)	
		}

		//TODO: Post event views

		if (event === null && eventId === null) { 
			console.log("No event is passed in. Incorrect state")
			Alert.alert("No event found",
						"Event doesn't exist. Something's not right yo!", 
						[
							{text: 'OK', onPress: () => this.props.navigation.goBack()}
						])
		}

	}

	async fetchAndPrepEvent(eventId) { 
		const eventsData = await this.eventAPI.getEvent(eventId, "tag");
		if (eventsData && eventsData.code !== -1) { 
				this.prepEvent(eventsData)
				this.setState({refreshed: !this.state.refreshed, loading: false})
				this.fetchingSimilarEvents(eventsData)
		} else { 
			Alert.alert("No event found",
					"Event doesn't exist. Something's not right yo!", 
					[
						{text: 'OK', onPress: () => this.props.navigation.goBack()}
					])
		}
	}

	async logEventView(eventId) { 
		const eventsData = await this.eventAPI.logEventView(eventId, "front_page");
		if (eventsData && eventsData.code !== -1) { 
			console.log("Logged event view")
		} else { 
			console.log("Error while logging event.")
		}
	}

	handleOpenMaps() { 
		AnalyticsManager.logEvent(events.USER_OPENED_EVENT_LOCATION)
		Linking.openURL("https://www.google.com/maps/search/?api=1&query=" + this.state.event.address)
	}

	async fetchingSimilarEvents(event) { 
		const zone = getZoneSlug(event)
		const weakThis = this
		const eventsData = await this.eventAPI.getUpcomingEvents({
				zone: zone,
				category: event.kind,
				limit: 10, 
				rank: 1, 
				exclude_ids: [event.id],
				orderBy: 'rank'
			});
		if (eventsData && eventsData.code !== -1) { 
			weakThis.setState({similarEvents: eventsData, refreshed: !this.state.refreshed})
		} else { 
			console.log("Failed to load similar events")
		}
	}

	handleVideoSelected(video) { 
		this.setState({modalVisible: true, videoUrl: video.url})
	}

	getRenderCell(item) {
		const { navigation } = this.props;
		const event = this.state.event
		if (item.index == 0) { 
			return (<EventDetailView
					event={event}
					onLocationClicked={() => this.handleOpenMaps()}/>)
		} 

		if (item.index == 1 && event.videos != null && event.videos.length !== 0) { 
			return (
				<View style={{marginLeft: 10, marginBottom: 10, backgroundColor: StylerInstance.getBackgroundColor()}}>
				{/* <H2 style={{fontWeight:'bold', marginBottom: 10, color: StylerInstance.getOutlineColor()}}> Videos </H2> */}
				<Heading style={{fontWeight:'bold', marginBottom: 10, color: StylerInstance.getOutlineColor()}}> Videos </Heading>

				<VideoListView
					data={event.videos}
					onVideoSelected={(video) => this.handleVideoSelected(video)}/>
				</View>)
		}

		if (item.index == 2) { 
			return (
				<View style={{marginLeft: 10, marginTop: 10, backgroundColor: StylerInstance.getBackgroundColor()}}>
				{/* <H2 style={{fontWeight:'bold', color: StylerInstance.getOutlineColor()}}> Chat </H2> */}
				<Heading style={{fontWeight:'bold', color: StylerInstance.getOutlineColor()}}> Chat </Heading>

				{this.state.comments && <CommentList
					showTimestamp={this.props.config && this.props.config.chat_timestamp_enabled}
					comments={this.state.comments}
					onUserImageClick={(user) => this.setState({popUser: user})}
					/>}
				</View>)
		}

		if (item.index === 3 && this.state.similarEvents.length !== 0) { 
			return (
				<Section
					style={{marginBottom: 20, marginTop: 20}}
					title={"Similar dope events"}
					items={this.state.similarEvents}
					handleVideoClick={(data) => this.handleVideoClick(data)}
					handleEventClick={(data) => {
						AnalyticsManager.logEvent(events.USER_CLICKED_SIMILAR)
						this.props.navigation.push('Event', { 
							eventId: data.id, 
							source: 'event_similar'
						})}
					}
				/>
			)
		}
	}

	handleNewComments(comments, event_id) { 
		console.log("GETTING BACK HELLA DATA FROM CHAT")
		this.setState({comments: comments.slice().reverse()})
	}

	joinConversation() { 
		console.log("JOIN CONVO PRESSED LOL")
		this.props.navigation.navigate('Chat', { 
			//WTF WHY DOES THIS WORK?
			comments: this.state.comments.slice().reverse(),
			title: this.state.event.title,
			event: this.state.event,
			eventId: this.state.event.id,
			handleMessages: this.handleNewComments.bind(this)
		})
	}

	openWebView(){ 
		const event = this.state.event
		const eventCost = event.cost

		const potentialRevenue = eventCost === 0 ? 0 : 100

		AnalyticsManager.logEvent(events.USER_CLICKED_TICKET, {revenue: potentialRevenue, cost: eventCost})
		

		if (event.external_url == null || event.external_url == '') { 
			Alert.alert("No need to RSVP!", 
						"Just show up ready to have a good time")
			return
		}

		try { 
			let result = Linking.openURL(this.state.event.external_url + "?aff=front_page");
			console.log(`result is ${result}`)
		} catch (error) { 
			console.log(`error is ${error}`)
			Alert.alert("Could not open WebBrowser")
		}
	}

	getVideoPlayer() { 
		return (<VideoPlayer
					visible={this.state.modalVisible}
					videoUrl={this.state.videoUrl}
					onExitClick={()=> this.setState({modalVisible: false})}
				/>)
	}

	async handleDM(user) {
		const result = await handleDMClick(user);
		if (result.data) { 
			const chatId = result.data.chat_id;
			this.setState({popUser: null});
			this.props.navigation.push('Chat', {chatId: chatId});
		} else { 
			if (result.type !== "cancel") { 
				Alert.alert("Failed to start direct message. Please try again later");
			}
		}
	}

	render() { 
		const videoPlayer = this.getVideoPlayer()
		if (this.state.event === null) { 
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<Spinner />
				</View>
			)
		}


		return (
			<View>
			
			<View style={{position: 'absolute', left: 0, bottom: 0, width: '100%', backgroundColor: 'white', zIndex: 200, borderTopWidth: 1, borderTopColor: 'lightgrey'}}>
					<HStack safeAreaBottom w="100%" flex={1} justifyContent={"center"}>
						<Button rightIcon={<Icon as={Entypo} name="ticket" type="Entypo"/>} __text={{color: StylerInstance.getOutlineColor()}} flex={1} colorScheme={"primary"} style={{margin: 5}} onPress={() => this.openWebView()}
						>RSVP</Button>
						<Button rightIcon={<Icon as={Feather} name="message-circle" type="Feather" />}  __text={{color: StylerInstance.getOutlineColor()}} flex={1} style={{margin: 5, backgroundColor: StylerInstance.getOutlineColor()}} onPress={() => this.joinConversation()}
						>Chat</Button>
					</HStack>
			</View>
			<View  style={{backgroundColor: StylerInstance.getBackgroundColor()}}> 
				<FlatList
					showsVerticalScrollIndicator={false}
					ref={this.state.flatRef}
					data={this.state.dummy}
					extraData={this.state.refreshed}
					renderItem={(item) => this.getRenderCell(item)}
					keyExtractor={(item, index) => item + index }
					ListFooterComponent={() => <View style={{height:100}}></View>}
				/>

           	 {videoPlayer}


           	 <UserProfilePopup 
           	 	user={this.state.popUser}
           	 	onDoneClicked={() => this.setState({popUser: null})}
				onDirectMessage={async (user) => await this.handleDM(user)}
           	 />

			</View>
			</View>

		)
	}
}

const style = { 
  bottomView:{
      width: '100%', 
      height: 50, 
      backgroundColor: '#FF9800', 
      justifyContent: 'center', 
      position: 'absolute',
      bottom: 0
     },
    container : { 
		marginBottom: 20,
	}
}

const mapStateToProps = (state) =>  {
	const { user, config } = state 
	return { user, config }
}

export default connect(mapStateToProps)(EventScreen)
