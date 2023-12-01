import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight, Alert } from 'react-native';
import { Image, Text, Button, View, Actionsheet } from 'native-base';
import moment from 'moment';
import ImageLoader from './ImageLoader';
import MainUser from './MainUser';
import Constants from '../constants/Colors'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { AnalyticsManager, events } from '../api/Analytics'
import BaseStyler from '../managers/BaseStyler'
import StylerInstance from '../managers/BaseStyler';
import Colors from '../constants/Colors';
import ParsedText from 'react-native-parsed-text';
import * as Linking from 'expo-linking'

export default class CommentCell extends Component {

	constructor(props) {
		super(props);
		this.state = {
			blockList: MainUser.getBlockList(),
			showActionSheet: false
		}
	}

	getCreatedAtTime() {
		const comment = this.props.comment
		const message = this.props.message
		var created_at = null

		if (comment != null) {
			created_at = comment.created_at
		} else {
			created_at = message.createdAt
		}

		const timePassed = moment(created_at).format('MMMM Do YYYY');
		return timePassed
	}

	getThumbnailImage(nullForEmpty = false) {
		const comment = this.props.comment
		const message = this.props.message
		var personUrl = '../assets/images/person.png'

		if (comment != null) {
			if (comment.creator.profile_image != null) {
				return { uri: comment.creator.profile_image.image }
			} else {
				if (nullForEmpty == false) {
					return require(personUrl)
				} else {
					return null
				}
			}
		}

		if (message != null) {
			if (message.user.avatar != null) {
				return { uri: message.user.avatar }
			} else {
				if (!nullForEmpty) {
					return require(personUrl)
				} else {
					return null
				}
			}
		}

		return require(personUrl)
	}

	getUsername() {
		var comment = this.props.comment
		const message = this.props.message

		if (message) {
			comment = this.props.message.comment;
		}

		return comment.creator.username
	}

	getUserId() {
		if (this.props.message) {
			return this.props.message.user._id
		} else {
			return this.props.comment.creator.id
		}
	}

	getAllowDms() {
		var comment = this.props.comment
		if (this.props.message) {
			comment = this.props.message.comment
		}
		console.log('comment', comment)
		return comment.creator.allow_dm;
	}

	getText() {
		const comment = this.props.comment
		const message = this.props.message

		if (comment != null) {
			return comment.value
		}

		return message.text
	}

	getUserBadge() {
		const comment = this.props.comment
		const message = this.props.message
		var string = null
		var color = null
		if (comment !== null && comment !== undefined) {
			if (comment.creator.is_staff === true) {
				string = "Admin"
				color = Colors.primaryETAButtonColor
			}
		}

		if (message !== null && message !== undefined) {
			if (message.user.is_staff === true) {
				string = "Admin"
				color = Colors.primaryETAButtonColor
			}
		}

		if (string !== null) {
			return (
				<View style={{ flexDirection: 'row' }}>
					<Ionicons name="ios-ribbon" style={{ color: Colors.primaryETAButtonColor, fontSize: 14 }} />
					<Text note style={{ color: color, fontSize: 12, marginLeft: 5 }}>{string}</Text>
				</View>)
		} else {
			return null
		}
	}


	handleClick() {
		AnalyticsManager.logEvent(events.USER_CLICKED_PROFILE)
		const username = this.getUsername()
		const image = this.getThumbnailImage(true)

		const user = {
			username: username,
			image: image,
			id: this.getUserId(),
			allow_dm: this.getAllowDms()
		}
		if (this.props.onUserImageClick) {
			this.props.onUserImageClick(user)
		}
	}

	handleUrlPress(url, matchIndex /*: number*/) {
		Linking.openURL(url);
	}

	renderText(matchingString, matches) {
		// matches => ["[@michel:5455345]", "@michel", "5455345"]
		let pattern = /(@[^:]+)/i;
		let match = matchingString.match(pattern);
		return `^^${match[1]}^^`;
	}

	handleTapMore() {
		this.setState({ showActionSheet: true })
	}

	handleBlockUser = async () => {
		const blockSuccessUser = await MainUser.blockUser(this.getUserId());
		if (blockSuccessUser) {
			Alert.alert("Sucess", "This user has been blocked. You will not see comments from them anymore.")
			this.setState({ blockList: blockSuccessUser.block_list })
		}
	}

	isCommenterBlocked() {
		const blockList = this.state.blockList.map((item) => item.id)
		const username = this.getUserId();
		return blockList.includes(username);
	}

	render() {
		const comment = this.props.comment
		const message = this.props.message
		if (comment == null && message == null) {
			return null
		}

		if (this.isCommenterBlocked()) {
			return null
		}

		return (
			<View pl={2} pr={2} mb={2} style={{ flex: 1, backgroundColor: StylerInstance.getBackgroundColor() }}>

				{/* <CardItem style={{flex: 1, backgroundColor: StylerInstance.getBackgroundColor()}}> */}
				<View style={{ flex: 1, flexDirection: 'row' }}>
					<TouchableHighlight onPress={() => this.handleClick()} style={{ marginRight: '3%' }}>
						<Image small rounded="full" source={this.getThumbnailImage()} style={{ height: 40, width: 40, borderRadius: 40 / 2 }} />
					</TouchableHighlight>
					<View flex={5}>
						<View style={{ flexDirection: 'row' }}>
							<View>
								<Text size={"small"} color={"coolGray.600"}>{this.getUsername()}</Text>
								{this.getUserBadge()}
							</View>
						</View>
						<ParsedText style={{ marginRight: 10, marginTop: 5, fontSize: 16, color: StylerInstance.getOutlineColor() }}
							parse={
								[
									{ type: 'url', style: styles.url, onPress: this.handleUrlPress }
								]
							}
						>
							{this.getText()}</ParsedText>
						{this.props.showTimestamp && <Text fontSize="xs" color="coolGray.500" style={{ fontSize: 10, marginTop: 10 }}>{this.getCreatedAtTime()}</Text>}

					</View>
					<View>
						<TouchableHighlight style={{ flex: 1, alignItems: 'flex-end' }}
							onPress={() => this.handleTapMore()}>
							<MaterialIcons name='expand-more' type='MaterialIcons' onPress={() => this.handleTapMore()}
								style={{ fontSize: 16, color: StylerInstance.choose("black", "white") }} />
						</TouchableHighlight>
					</View>
				</View>

				{/* </CardItem> */}
				<Actionsheet isOpen={this.state.showActionSheet} onClose={() => this.setState({ showActionSheet: false })}>
					<Actionsheet.Content>
						<Actionsheet.Item onPress={() => Alert.alert("Sucess", "Thanks for reporting the comment. We will review it and contact the user if needed!")}>Report comment</Actionsheet.Item>
						<Actionsheet.Item onPress={() => this.handleBlockUser()}>Block user</Actionsheet.Item>
						<Actionsheet.Item onPress={() => this.setState({ showActionSheet: false })}>Cancel</Actionsheet.Item>
					</Actionsheet.Content>

				</Actionsheet>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF',
	},

	url: {
		color: Constants.primaryETAButtonColor,
		textDecorationLine: 'underline',
	},

	email: {
		textDecorationLine: 'underline',
	},

	text: {
		color: 'black',
		fontSize: 15,
	},

	phone: {
		color: 'blue',
		textDecorationLine: 'underline',
	},

	name: {
		color: 'red',
	},

	username: {
		color: Constants.primaryETAButtonColor,
		fontWeight: 'bold'
	},

	magicNumber: {
		fontSize: 42,
		color: 'pink',
	},

	hashTag: {
		fontStyle: 'italic',
	},

});