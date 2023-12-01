import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView } from 'react-native';
import CommentCell from './CommentCell'


export default class CommentList extends Component { 

	constructor(props) {
		super(props)
		this.state = { 
			comments : [{key: "A"}, {key: "B"}, {key: "C"}, {key : "D"}]
		}
	}

	handleProfileClick(user) { 
		if (this.props.onUserImageClick) { 
			this.props.onUserImageClick(user)
		}
	}

	render() { 
		if (this.props.comments === null) { 
			return null
		}
		
		if (this.props.comments.length == 0) { 
			return (<View style={{flex: 1}}> 
					<Text style={{color:'gray', marginTop: '2%'}}> No comments..add one! </Text>
					</View>)
		}

		return (
		<View>
	 		<FlatList
				data = {this.props.comments}
				renderItem = {(entry) => <CommentCell
										 showTimestamp={this.props.showTimestamp}
										 onUserImageClick={(user) => this.handleProfileClick(user)}
										 onPress={(comment) => this.props.onCellPress(comment)}
										 comment={entry.item}/> 
										}
				keyExtractor={(item, index) => item.id.toString()}
			/>
		</View>
		)
	}
}