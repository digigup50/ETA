import { View, FlatList, AppState, Alert, TouchableHighlight, Linking } from 'react-native'
import React, { Component } from 'react';
import { Heading, H3, Button, Text, Spinner, Divider } from 'native-base';
import MainUser from '../components/MainUser';
import EventCellView from '../components/EventCellView';
import { backgroundColor } from '../constants/Colors'
import { connect } from 'react-redux'
import CommentAPI from '../api/CommentAPI'
import { getMinimumDate, getUserPicture, getZoneSlug } from '../managers/UtilsManager'
import ChatCellView from '../components/ChatCellView'
import moment from 'moment'
import { putChatNotificationCount } from '../store'
import { AnalyticsManager, events } from '../api/Analytics'
import * as Permissions from 'expo-permissions';
import UserAPI from '../api/UserAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StylerInstance from '../managers/BaseStyler';
class UserChatScreen extends Component {


	constructor(props) {
		super(props)
		this.state = {
			eventChats: [],
			loaded: false,
			subscription: null,
			refreshing: false,
			commentsMap: {},
			deniedNotification: false,
			appState: AppState.currentState
		}

		this.commentAPI = new CommentAPI()
	}


	componentDidMount() {

		const didFocusSubscription = this.props.navigation.addListener(
			'focus', payload => {
				this.handleNotificationStatus()
				AnalyticsManager.logEvent(events.USER_CLICK_CHAT_TAB)
				this.calculateNotifications()
				this.getUserEventChats()
			}
		)
		this.setState({ subscription: didFocusSubscription })
		this._appStateListener = AppState.addEventListener('change', (next) => this._handleAppStateChange(next));
		this.handleNotificationStatus()
		this.getUserEventChats()
	}

	componentWillUnmount() {
		this._appStateListener.remove();
		const sub = this.state.subscription;
		if (sub && typeof sub === "function") {
			sub();
		}
	}

	findInChats(chat, settings) {
		const result = settings.find(setting =>
			setting.chat !== null && setting.chat.id === chat.id)
		return result !== undefined
	}

	async getChats(chats) {
		const slug = getZoneSlug(this.props.user)
		const chatMessage = await this.commentAPI.getChats(slug, ['zone']);
		// console.error(chatMessage);
		if (chatMessage && chatMessage.code !== -1) {
			const newChats = chatMessage.filter(chat => !this.findInChats(chat, chats))
			if (newChats.length > 0) {
				const wrap = newChats.map(function (entry) { return { type: "chat", data: entry } })
				this.setState({ eventChats: wrap.concat(chats), loaded: true, refreshing: false })
			} else {
				this.setState({ eventChats: chats, loaded: true, refreshing: false })
			}
		} else {
			Alert.alert("Something went wrong..", "Failed to load chats")
			this.setState({ loaded: true, refreshing: false })
			console.log(error)
		}
		const existinChats = []
		for (chat of this.state.eventChats) {
			var userChatSetting = chat;

			if (userChatSetting.event) {
				userChatSetting.name = userChatSetting.event.title;
				userChatSetting.lastCommentAt = userChatSetting.event.newest_comment ? userChatSetting.event.newest_comment.created_at : getMinimumDate;
			} else if (userChatSetting.chat || userChatSetting.type === "chat") {
				var chat = userChatSetting.chat;
				if (userChatSetting.type === "chat") {
					chat = userChatSetting.data
				}
				const recentComments = chat.recent_comments
				userChatSetting.name = chat.name
				userChatSetting.lastCommentAt = recentComments.length > 0 ? chat.recent_comments[0].created_at : getMinimumDate();
			}
			existinChats.push(userChatSetting);
		}

		existinChats.sort((a, b) => {
			var dataA = this.getChatData(a);
			var dataB = this.getChatData(b);
			return Date.parse(dataB.lastCommentAt) - Date.parse(dataA.lastCommentAt);
		})

		this.setState({ eventChats: existinChats });
	}

	getChatData(chat) {
		var chat = chat;
		if (chat.type === "chat") {
			chat = chat.data
		}
		return chat;
	}

	async getUserEventChats() {
		const userAPI = new UserAPI()
		const meResp = await userAPI.getUserEventsChats('v1', ['zone', 'from_individual', 'to_individual']);
		if (meResp && meResp.code !== -1) {
			this.getChats(meResp);
		} else {
			Alert.alert("Something went wrong",
				"Failed to load chats")
			this.setState({ loaded: true, refreshing: false })
			console.log(meResp)
		}
	}

	handleRefresh() {
		this.setState({ refreshing: true })
		this.getUserEventChats()
	}

	calculateNotifications() {
		var totalNotifications = 0
		for (chat of this.state.eventChats) {
			if (chat.type === "chat") {
				totalNotifications += this.getBadgeCount(chat.data.recent_comments)
			}
		}

		this.props.dispatch(putChatNotificationCount(totalNotifications))

		if (this.props.lastChatViewTime) {
			AsyncStorage.setItem('lastChatView', this.props.lastChatViewTime.toString())
		}

	}

	async handleNotificationStatus() {
		const { status: existingStatus } = await Permissions.getAsync(
			Permissions.NOTIFICATIONS
		);

		if (existingStatus !== 'granted') {
			this.setState({ deniedNotification: true })
		} else {
			this.setState({ deniedNotification: false })
		}
	}

	handleNewComments(messages, eventId = null, chatId = null) {
		var commentsMap = this.state.commentsMap
		if (eventId !== null) {
			commentsMap[eventId] = messages
			this.setState({ comments: commentsMap })
		}
	}

	handleOnPress(chat) {
		// We need this type == chat because the list has UserEventSetting and Chat models. Chat models will have type == "chat"
		// UserEventSetting has a "chat" property. 
		if (chat.type == "chat") {
			this.props.navigation.navigate("Chat", {
				"chatId": chat.data.id,
				"title": chat.data.name,
				handleMessages: this.handleNewComments.bind(this)
			})
		} else {
			var chatSetting = this.state.eventChats.find(function (eventChat) {
				return eventChat.id === chat.id
			})

			if (chatSetting.chat !== null && chatSetting.chat !== undefined) {
				this.props.navigation.navigate("Chat", {
					chatId: chatSetting.chat.id,
					title: chatSetting.chat.name,
					handleMessages: this.handleNewComments.bind(this),
					eventSetting: chatSetting
				})
			} else {
				// console.log(eventSetting)
				const event = chatSetting.event
				this.props.navigation.navigate("Chat", {
					comments: this.state.commentsMap[event.id],
					title: event.title,
					eventId: event.id,
					event: event,
					eventSetting: chatSetting,
					handleMessages: this.handleNewComments.bind(this)
				})
			}
		}
	}

	isMuted(userEvent) {
		if (userEvent.notify_new_comment) {
			return false
		} else {
			return true
		}
	}

	_handleAppStateChange(nextAppState) {
		console.log("=======CHAT APP STATE CHANGING=====")
		if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
			console.log("hANDLING NOTIFICATION STATUS")
			this.handleNotificationStatus()
		}
		if (this.state) {
			this.setState({ appState: nextAppState });
		}
	}

	getBadgeCount(comments) {
		var count = 0
		for (comment of comments) {
			const momentTime = moment(comment.created_at)
			const propsMomentTime = moment(this.props.lastChatViewTime)
			console.log(`comparing ${momentTime} with last chat time of ${propsMomentTime}`)
			if (momentTime.isAfter(propsMomentTime)) {
				count += 1
			}
		}
		return count
	}

	getItemRender(item, total = 0) {
		// We need this type == chat because the list has UserEventSetting and Chat models. Chat models will have type == "chat"
		// UserEventSetting has a "chat" property. 
		var chat = item.chat
		if (!chat && item.type == "chat") {
			chat = item.data
		}
		if (chat) {
			var image = null
			var chatTitle = chat.name
			if (chat.from_individual_id) {
				if (!MainUser.getUser()) {
					return null;
				}
				const splitChatName = chat.name.split(":")
				for (var name of splitChatName) {
					if (name != MainUser.getUser().username) {
						chatTitle = name;
					}
				}
				if (chat.from_individual_id === MainUser.getUserId()) {
					image = getUserPicture(chat.to_individual);
				} else {
					image = getUserPicture(chat.from_individual);
				}
			}
			const commentSize = chat.recent_comments.length;
			var lastCommenter = { creator: { username: "" }, value: "" }
			if (commentSize > 0) {
				lastCommenter = chat.recent_comments[0]
			}
			if (chat.zone) {
				image = chat.zone.image
			}
			return <ChatCellView
				title={chatTitle}
				username={lastCommenter.creator.username}
				image={image}
				badgeCount={this.getBadgeCount(chat.recent_comments).toString()}
				value={lastCommenter.value}
				muted={this.isMuted(item)}
				onPress={() => this.handleOnPress(item)}
			/>
		}
		else {
			return <EventCellView
				event={item.event}
				cellType="comment"
				onPress={() => this.handleOnPress(item)}
				muted={this.isMuted(item)}
			/>
		}
	}

	handleNotificationHeaderClick() {
		AnalyticsManager.logEvent(events.USER_REENGAGED_NOTIFICATION)
		Linking.openURL("app-settings:")
	}

	getNotificationHeader() {
		if (this.state.deniedNotification) {
			return <TouchableHighlight style={{ backgroundColor: '#8884d8' }} onPress={() => this.handleNotificationHeaderClick()}>
				<View style={{ margin: '3%' }}>
					<Text style={{ color: 'white', fontWeight: 'bold' }}>You're missing out</Text>
					<Text style={{ color: 'white' }}>Turn on notifications to be notified about dope events and responses to your comments</Text>
				</View>
			</TouchableHighlight>
		} else {
			return null
		}
	}

	render() {
		if (this.state.loaded == false) {
			return (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: StylerInstance.getBackgroundColor() }}>
					<Spinner />
				</View>)
		}

		if (this.state.eventChats.length == 0) {
			return (
				<View style={{ flex: 1, backgroundColor: StylerInstance.getBackgroundColor() }}>
					{this.getNotificationHeader()}
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
						<Heading style={{ color: StylerInstance.getOutlineColor() }}>No event chats</Heading>
						{/* <H3 style={{color: StylerInstance.getOutlineColor()}}>No event chats</H3> */}
						<Text style={{ color: StylerInstance.getOutlineColor() }}>Comment or RSVP on an event </Text>
						<Text style={{ color: StylerInstance.getOutlineColor() }}>to join the event chats </Text>
					</View>
				</View>
			)
		}

		return (
			<View style={{ flex: 1, backgroundColor: StylerInstance.getBackgroundColor() }}>
				{this.getNotificationHeader()}
				<FlatList
					data={this.state.eventChats}
					onRefresh={() => this.getUserEventChats()}
					keyExtractor={(item, index) =>
						index.toString() + item.id
					}
					ItemSeparatorComponent={<Divider color={"coolGray.600"} />}
					refreshing={this.state.refreshing}
					renderItem={(item) => this.getItemRender(item.item)}
				>
				</FlatList>
			</View>
		)
	}

}

const mapStateToProps = (state) => {
	const { user, lastChatViewTime } = state
	return { user, lastChatViewTime }
}

export default connect(mapStateToProps)(UserChatScreen)