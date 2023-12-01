import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight, Image, Linking, Alert } from 'react-native';
import { Image as CachedImage } from 'react-native-expo-image-cache'; 
import { Heading, View,  Button, Badge, Text} from 'native-base';
import BufferedTextField from './BufferedTextField';
import moment from 'moment';
import Divider from './Divider';
import { EvilIcons, MaterialIcons, Entypo } from '@expo/vector-icons'
import LiveViewButton from './LiveViewButton'
import { getZone } from '../managers/UtilsManager'
import UserViewCell from './UserViewCell'
import { getPhoto } from '../managers/UserPhotoManager'
import Colors from '../constants/Colors'
import { WebView } from 'react-native-webview';
import StylerInstance from '../managers/BaseStyler'
import { AnalyticsManager, events } from '../api/Analytics';
import RenderHtml from 'react-native-render-html';
import { Dimensions} from 'react-native';

export default class EventDetailView extends Component { 

	constructor(props) { 
		super(props)
	}

	componentDidMount(){

	}

	getTimeZone() { 
		var timezone = null
		const event = this.props.event
		const eventZone = getZone(event)
		if (eventZone !== null) { 
			timezone = eventZone.time_zone
		}
		return timezone
	}

	getStartTimeAndEndDate() { 
		const event = this.props.event
		const timezone = this.getTimeZone()
		const startFormat = moment.tz(event.start_date, timezone).format('ddd MMM Do')
		const endFormat = moment.tz(event.end_date, timezone).format('ddd MMM Do')
		return startFormat + " - " + endFormat
	}


	getStartTimeAndEndTime() { 
		const event = this.props.event
		const timezone = this.getTimeZone()
		const startFormat = moment.tz(event.start_date, timezone).format('h:mm a')
		const endFormat = moment.tz(event.end_date, timezone).format('h:mm a')
		return startFormat + " - " + endFormat
	}

	getEventImage() { 
		const event = this.props.event
		if (event.image_url == null || event.image_url == '') { 
			return (<Image source={require('../assets/images/3.jpg')} style={s.backgroundImage}/>)
		} else { 
			return (<CachedImage uri={event.image_url} style={s.backgroundImage}/>)
		}
	}

	onClickLocation() { 
		this.props.onLocationClicked()
	}


	getCost() { 
		if (this.props.event.cost == 0) {
			return "Free"
		} 

		return "$" + this.props.event.cost
	}

	getTips() { 
		const event = this.props.event
		if (event.tips != null && event.tips !== '') { 
			return (
					<View>
						{/* <H3 style={{fontWeight:'bold', marginBottom: 10}}>Our Tips</H3> */}
						<Heading style={{fontWeight:'bold', marginBottom: 10}}>Our Tips</Heading>

						<BufferedTextField text={event.tips} />
						<Divider />
					</View>
				)
		}
		return null
	}

	getEventLocationDetail() {
		const event = this.props.event 
		if (event.place != null) { 
			return (
				<View>
					<Text style={{fontWeight:'500', fontSize:14, marginBottom:5, color: StylerInstance.getOutlineColor()}}>{event.place}</Text>
					<Text style={{fontSize: 12, color: 'gray', marginRight: 10, color: StylerInstance.getOutlineColor()}}>{event.address}</Text>
				</View>)
		} else { 
			return (<Text style={{fontWeight:'500', fontSize:14, marginBottom:5, marginRight:10}}>{event.address}</Text>)
		}
	}


	getPromoterDetails(){
		console.log("promoter details")
		console.log(this.props.event)
		if (this.props.event.promoter !== null && this.props.event.promoter !== undefined) { 
			const promoter = this.props.event.promoter

			return <View style={{backgroundColor: StylerInstance.getBackgroundColor()}}>
			<View>
			<UserViewCell
				image_url={getPhoto(promoter.image)}
				title={"Organizer of " + this.props.event.title}
				username={promoter.username}
				email={promoter.email}
				style={{marginRight: 10}}
				onClick={() => Linking.openURL("https://www.witheta.com/o/" + promoter.id)}
			/>
			<Button  variant="link" style={{height:30, marginTop: '5%', alignSelf: 'center'}}
								onPress={()=> Linking.openURL(`mailto:${promoter.email}`)} _text={{color: Colors.primaryETAButtonColor, fontSize: 12}}> 
								Contact
							</Button>

			</View>
			<Divider visible={false}/>
			</View>
		}
	}

	render() {
		const event = this.props.event
		const { width } = Dimensions.get('window').width
		const tagStyles = {
			div: {color: StylerInstance.getOutlineColor()},
			p : { color: StylerInstance.getOutlineColor()}, 
			a : {color: StylerInstance.getOutlineColor()}, 
			h1: { color: StylerInstance.getOutlineColor()}, 
			h2: { color: StylerInstance.getOutlineColor()},
			h3: { color: StylerInstance.getOutlineColor()},
			h4: { color: StylerInstance.getOutlineColor()}
		}
		
		return ( 
			<View style = {{backgroundColor:StylerInstance.getBackgroundColor(), flex: 1}}>
				<View style={{height:350}}>
					{this.getEventImage()}
				</View>

				<View style={{margin:10, marginTop: 20}}>
					{/* Title View */}
					<View>
						<Heading style={{fontWeight: 'bold', marginBottom: '5%', color: StylerInstance.getOutlineColor()}}>{event.title}</Heading>
					</View>
					{/* Address and Date, Time, Cost */}
					<View style={{marginBottom:20}}>
						{/* Address */}
						<View style={{flexDirection:'row', marginBottom:10, marginRight:30}}>
							<EvilIcons style={{marginRight: 10, color: StylerInstance.getOutlineColor()}} size={32} name="location" type="EvilIcons"/>
							<View style={{justifyContent: 'space-between'}}>
								{this.getEventLocationDetail()}
								<TouchableHighlight style={{marginTop: 5, marginBottom: 5}} onPress={() => this.onClickLocation()}>
									<Text style={{color: Colors.primaryETAButtonColor, fontSize: 12}}>Open in maps</Text>
								</TouchableHighlight>
							</View>
						</View>
						{/* Date & Time */}
						<View style={{flexDirection:'row', marginBottom:20}}>
							<View>
								<EvilIcons style={{marginRight:10, color: StylerInstance.getOutlineColor()}} size={32} name="calendar" type="EvilIcons"/>
							</View>
							<View>
								<Text style={{fontSize: 14, fontWeight:'500', color: StylerInstance.getOutlineColor()}}>{this.getStartTimeAndEndDate()}</Text>
								<Text style={{fontSize: 12, color: 'gray'}}>{this.getStartTimeAndEndTime()}</Text>
							</View>
						</View>

						{/* Cost */}
						<View> 
							<View style={{flexDirection: 'row'}}>
								<View>
									<MaterialIcons style={{marginRight:12, color: StylerInstance.getOutlineColor()}} size={32} name="attach-money" type="MaterialIcons"/>
								</View>
								<View>
									<Text style={{fontSize: 16, fontWeight:'500', color: StylerInstance.getOutlineColor()}}>{this.getCost()}</Text>
									<Text style={{color:'gray'}}>with RSVP</Text>
								</View>
							</View>
						</View>
						{/* <View style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
							<LiveViewButton event={this.props.event}/>
						</View> */}

						{/* Tags */}
						{event.tags && <View style={{display: 'flex', flexDirection: 'row', width: '100%', flexWrap: 'wrap', marginTop: 20}}>{event.tags.map((item, index) => 
						<TouchableHighlight onPress={() => {
							AnalyticsManager.logEvent(events.TAG_CLICKED)
							Alert.alert(item.description)}}>
							<Badge colorScheme={"primary"}  rounded="full" variant="solid" style={{marginRight: 8, marginTop: 5}}>{item.label}</Badge>
							</TouchableHighlight>)}
						</View>}
					</View>
				
					<Divider
						visible={false}
						/>

					<View>
						{/* <H3 style={{fontWeight:'bold', marginBottom: 10, color: StylerInstance.getOutlineColor()}}>About</H3> */}
						<Heading style={{fontWeight:'bold', marginBottom: 10, color: StylerInstance.getOutlineColor()}}>About</Heading>

						{!event.body_html && <BufferedTextField 
						textStyle={{color: 'gray'}}
						text={event.description}/>}
						
						{event.body_html && <RenderHtml
						contentWidth={width}
						source={{html: event.body_html}}
						tagsStyles={tagStyles}
						/>}
					</View>

					<Divider visible={false}
					/>

					{this.getPromoterDetails()}

					{this.getTips()}

				</View>
			</View>
			)
	}
}

const s = StyleSheet.create({
  backgroundImage: {
      flex: 1,
      width: null,
      height: 200,
      alignItems: 'flex-end',
      flexDirection: 'row'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'black',
    opacity: 0.40
  }
});