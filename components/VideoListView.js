import React, { Component } from 'react'
import { View, FlatList, Text } from 'react-native';
import VideoCell from './VideoCell';


export default class VideoListView extends Component { 
	constructor() { 
		super()
	}

	handleVideoPress(video) {
		this.props.onVideoSelected(video) 
	}

	_renderCell(cell, index) { 
		return (<VideoCell
			video={cell.item}
			onVideoPress={(video) => this.handleVideoPress(video)}/>)
	}

	render() { 
		return (
			<View>
				<FlatList
				style={{display: 'flex', flexDirection: 'row'}}
				data={this.props.data}
				renderItem={(cell, index) => this._renderCell(cell, index)}
				keyExtractor={(item, index) => item.id.toString()}
				horizontal={true}
				/>
			</View>
		)
	}

}