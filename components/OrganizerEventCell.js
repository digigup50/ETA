import React, { Component } from 'react';
import { View, ImageBackground, StyleSheet, TouchableHighlight } from 'react-native';
import { CacheManager } from 'react-native-expo-image-cache';
import CommentCell from './CommentCell' 
import VideoListView from './VideoListView'
import moment from 'moment';
import { Container, H1, H2, Header, Content, Card, CardItem, ListItem, Thumbnail, Text, Button, Left, Body, Right } from 'native-base';
import { Ionicons } from '@expo/vector-icons'

export default class OrganizerEventCell extends Component { 
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
		const val = moment(this.props.event.start_date).format('ddd MMM Do, h:mm a')
		return val.toString()
	}

	async getBackgroundImage() { 
		if (this.props.event.image_url == null || this.props.event.image_url == '') { 
			const image = require('../assets/image/3.jpg')
			this.setState({image: image})
		} else { 
			const path = await CacheManager.get(this.props.event.image_url).getPath();
			const image =  {uri: path}
			this.setState({image: image})
		}
	}

	getCommentCount() { 
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
				<Right>
					<Ionicons name="md-notifications-off" type="Ionicons"/>
				</Right>
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

	render() { 
		const event = this.props.event
		const cellType = this.props.cellType
		if (cellType == "comment") { 
			return (
					<ListItem thumbnail onPress={()=> this.onPress()}>
						<Left>
						<Thumbnail square source={this.state.image}/> 
						</Left>
						<Body>
							<Text style={{fontWeight:'bold'}}>{this.props.event.title}</Text>
							<Text numberOfLines={1}>{this.props.event.newest_comment.creator.username}: {this.props.event.newest_comment.value}</Text>
						</Body>
						{this.getMuted()}
					</ListItem>
				)
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
			<TouchableHighlight onPress={()=> this.onPress()}>
			<Card>
            <CardItem cardBody>
              <ImageBackground source={this.state.image} style={s.backgroundImage}>
               <View style={s.overlay}/>
               <View style={{margin:10}}>
              		<H2 style={{color: 'white'}}>{this.props.event.title}</H2>
              		<Text style={{color: 'white'}}>{this._getDateAndTimeFormat()}</Text>
              		<Text note style={{color:'white'}}>{this.getDisplayLocation()} </Text>
              	</View>
              </ImageBackground>
            </CardItem>
             {videoList}
            <CardItem style={{height:40, marginBottom:0}}>
            <Text note>{this.getCommentCount()}</Text>
            </CardItem>
          </Card>
          </TouchableHighlight>
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