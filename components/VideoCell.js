import React, { Component } from 'react';
import { View, TouchableHighlight, Image, Text } from 'react-native'
import { CacheManager } from 'react-native-expo-image-cache';
import moment from 'moment';


export default class VideoCell extends Component { 

	constructor() { 
		super()
		this.state = { 
			image:require('../assets/images/icon.png')
		}
	}

	componentDidMount() { 
		this.getImageSource()
	}

	onVideoPress() { 
		this.props.onVideoPress(this.props.video)
	}

	getCreatedAtTime() { 
		const video = this.props.video
		var created_at = video.created_at

		const timePassed = moment(created_at).startOf('minute').fromNow();
		return timePassed
	}

	async getImageSource() { 
		const thumbnail = this.props.video.thumbnail
		console.log(this.props.video)
		console.log(thumbnail)
		if (thumbnail == null) { 
			this.setState({image: require('../assets/images/icon.png')})
		} else { 
			const path = await CacheManager.get(this.props.video.thumbnail.url).getPath();
			const image =  {uri: path}
			this.setState({image: image})
		}
	}

	render() { 
		return (
			<TouchableHighlight style={{marginRight:8}} onPress={()=> this.onVideoPress()}>
				<View style={{alignItems:'center'}}>
				<Image 
					style={{height: 45, width:45, borderRadius: 45/2, borderWidth:4, borderColor: 'purple'}}
					source={this.state.image}
				/> 
				</View>
			</TouchableHighlight>
		)
	}

}