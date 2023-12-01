import React, { Component } from 'react';
import { View, ImageBackground, StyleSheet, TouchableHighlight } from 'react-native';
import { CacheManager } from 'react-native-expo-image-cache';
import CommentCell from './CommentCell' 
import VideoListView from './VideoListView'
import moment from 'moment-timezone';
import {  Heading, Card, Text, Body, Icon, Badge } from 'native-base';
import LiveViewButton from './LiveViewButton'
import { getTimeZone } from '../managers/UtilsManager'
import { connect } from 'react-redux'
import StylerInstance from '../managers/BaseStyler';

const UNIVERSE = 'rgba(28,35,43,.15)'

 class EventCellView extends Component { 
	constructor(props) { 
		super(props)
		this.state = { 
			image: null
		}
	}

	componentDidMount() {
		this.getBackgroundImage()
	}

	onPress() { 
		this.props.onPress(this.props.event)
	}

	_getDateAndTimeFormat() { 
		const timezone = getTimeZone(this.props.event)
		const val = moment.tz(this.props.event.start_date, timezone).format('ddd MMM Do, h:mm a')
		return val.toString()
	}

	async getBackgroundImage() { 
		if (this.props.event.image_url == null || this.props.event.image_url == '') { 
			const image = require('../assets/images/3.jpg')
			this.setState({image: image})
		} else { 
			const path = await CacheManager.get(this.props.event.image_url).getPath();
			const image =  {uri: path}
			this.setState({image: image})
		}
	}


	getCommentCount() {
		if (this.props.event.comments === null || this.props.event.comments === undefined) { 
			return ""
		}
		const commentCount = this.props.event.comments.length
		if (commentCount == 0) { 
			return "View info and chat"
		}

		if (commentCount == 1) { 
			return "View 1 comment"
		}

		return "View all " + this.props.event.comments.length + " comments"

	}

	getMuted() { 
		if (this.props.muted == true) { 
			return (
				// <Right>
					<Icon name="md-notifications-off" type="Ionicons"/>
				//</Right> 
				)
		} else { 
			return null
}
	}

	getDisplayLocation() { 
		const event = this.props.event
		if (event.place == null) { 
			return event.address
		} else { 
			return event.place
		}
	}

	dispatchVideoClick(video) { 
		this.props.onDispatchVideo(video)
	}

	getOrderView() { 
		if (this.props.order !== null && this.props.order !== undefined) { 
			let tickets = this.props.order.tickets
			let map = {}
			for (const ticket of tickets) { 
				if (!map[ticket.ticket_group.title]) { 
					map[ticket.ticket_group.title] = 1
				} else {
					map[ticket.ticket_group.title] += 1
				}
			}

			const keys = Object.keys(map)
			const result = keys.map((item, index) => 
				<View><Text style={{color:'white'}}>{map[item]} x {item}</Text></View>)
			return result
		}
		return null
	}

	handleConfigTags() { 
		if (this.props.event.tags) { 
			return this.props.event.tags.map((item, index) => <Badge 
			colorScheme={"primary"}  rounded="full" variant="solid" style={{marginRight: 2}}>{item.label}</Badge>)
		}
	}

	render() { 
		const event = this.props.event
		const cellType = this.props.cellType
		if (cellType == "comment") { 
			return (
					<Pressable>
					{/* // <ListItem thumbnail onPress={()=> this.onPress()}> */}
						{/* <Left> */}
						{/* <Thumbnail square source={this.state.image}/>  */}
						{/* </Left> */}
						{/* <Body> */}
							<Text style={{fontWeight:'bold', color: StylerInstance.getOutlineColor()}}>{this.props.event.title}</Text>
							{this.props.event.newest_comment && <Text numberOfLines={1} style={{color: StylerInstance.getOutlineColor()}}>{this.props.event.newest_comment.creator.username}: {this.props.event.newest_comment.value}</Text>}
						{/* </Body> */}
						{this.getMuted()}
					{/* // </ListItem> */}
					</Pressable>
				)
		}


		var commentCell = null
		if (event.newest_comment !== null && event.comments !== null && event.comments !== undefined){
			commentCell = (<CommentCell 
							showTimestamp={this.props.config && this.props.config.chat_timestamp_enabled}
							comment={event.comments[event.comments.length - 1]}/>)
		}

		var videoList = null
		if (event.videos != null && event.videos.length != 0) { 
			videoList = (
				<View style={{marginTop:10}}>
						<VideoListView 
						data={event.videos}
						onVideoSelected={(video) => this.dispatchVideoClick(video)}/>
				</View>
				)
		}

		return (
			<TouchableHighlight style={{borderRadius: 8}} onPress={()=> this.onPress()}>
			<Card style={{borderRadius: 8, overflow: 'hidden'}}>
            {/* <CardItem cardBody> */}
              <ImageBackground source={this.state.image} style={s.backgroundImage}>
               <View style={s.overlay}/>
               <View style={{padding: 10, width: '100%'}}>
              		{/* <H2 style={{color: 'white', fontWeight: 'bold'}}>{this.props.event.title}</H2> */}
					<Heading style={{color: 'white', fontWeight: 'bold'}}>{this.props.event.title}</Heading>
              		<Text bold mt={1} style={{color: 'white'}}>{this._getDateAndTimeFormat()}</Text>
              		<View style={{display: 'flex',  flexDirection: 'row', justifyContent: 'space-between'}}>
              			<Text mt={1} style={{color:'white'}}>{this.getDisplayLocation()} </Text>
              			{this.getOrderView()}
              		</View>
					<View style={{display: 'flex', flexDirection: 'row', marginTop: 10}}>
					{this.handleConfigTags()}
					</View>
	             {videoList}
	                {/* <LiveViewButton event={this.props.event}/> */}
	              <Text note style={{color: 'white', marginTop:20}}>{this.getCommentCount()}</Text>
              	</View>
              </ImageBackground>
            {/* </CardItem> */}
          </Card>
          </TouchableHighlight>
			)
	}
}


const s = StyleSheet.create({
  backgroundImage: {
      flex: 1,
      width: null,
      minHeight: 250,
      alignItems: 'flex-end',
      flexDirection: 'row'
  },
  shadow : { 
  	shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: 'gray',
    shadowOffset: { height: 0, width: 0 }
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


const mapStateToProps = (state) =>  { 
	const { config } = state
	return { config }
}

export default connect(mapStateToProps)(EventCellView)
