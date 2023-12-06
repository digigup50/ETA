import {
	View, Alert, TouchableHighlight,
	AppState, SafeAreaView, StyleSheet, Platform, Share, FlatList, RefreshControl, TouchableOpacity, Image
} from 'react-native';
import React, { Component } from 'react';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import AppLoading from 'expo-app-loading';
import { Video } from 'expo-av'
import * as Permissions from 'expo-permissions'
import UserAPI from '../api/UserAPI';
import EventAPI from '../api/EventAPI';
import ZoneAPI from '../api/ZoneAPI'
import { AnalyticsManager, events as AnalyticEvents, events } from '../api/Analytics'
import MainUser from '../components/MainUser'
import EventListView from '../components/EventListView'
import { Heading, Toast, Button, Container, Text, Icon, Spinner } from 'native-base'
import VideoPlayer from '../components/VideoPlayer'
import { registerForPushNotificationsAsync } from '../components/Helper'
import StoryAPI from '../api/StoryAPI';
import CuratorAPI from '../api/CuratorAPI'
import SectionAPI from '../api/SectionAPI'
import StoryViewCell from '../components/StoryViewCell'
import { backgroundColor } from '../constants/Colors'
import moment from 'moment-timezone'
import CityPickerModal from '../components/CityPickerModal'
import UserViewCell from '../components/UserViewCell'
import Colors from '../constants/Colors'
import Section from '../components/Section'
import { connect } from 'react-redux'
import { overwrite, putChatNotificationCount, setLastChatViewTime, setAppConfig, setIpCity } from '../store'
import { bindActionCreators } from 'redux';
import CommentAPI from '../api/CommentAPI'
import { getTimeZone, getConfig } from '../managers/UtilsManager'
import NewProductModal from '../components/NewProductModal'
import RatingView from '../components/RatingView'
import AnnounceAPI from '../api/AnnounceAPI'
import compareVersions from 'compare-versions'
import Constants from 'expo-constants';
import SimplePopup from '../components/SimplePopup'
import * as Font from 'expo-font'
import AsyncStorage from '@react-native-async-storage/async-storage';
import StylerInstance from '../managers/BaseStyler'
import * as Sentry from 'sentry-expo';
import * as Linking from 'expo-linking';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


class HomeScreen extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			user: null,
			events: [],
			initiallyLoaded: false,
			loaded: null,
			dummy: [{ key: "annoucement" }, { key: "carousal" }, { key: "featured_events" }, { key: "curator" }, { key: "section" }, { key: "events" }, { key: "rating" }],
			subscriptions: [],
			refreshing: false,
			refreshed: false,
			appState: AppState.currentState,
			modalVisible: false,
			notLiveVisible: false,
			cityPickerVisible: false,
			videoUrl: null,
			organizerEvents: [],
			stories: [],
			cityCurators: [],
			sections: [],
			featuredEvents: null,
			zone: null,
			zones: [],
			announcements: [],
			subtitles: {
				party: "Grab a drink, throw it back and turn up.",
				culture: "Artsy moves & dialogues are always a vibe.",
				class: "Unique ways to sweat and learn somethin' new.",
				professional: "Up your career and excellence."
			},
			needsUpdate: false
		}

		this.userAPI = new UserAPI()
		this.eventAPI = new EventAPI()
		this.curatorAPI = new CuratorAPI()
		this.storyAPI = new StoryAPI()
		this.sectionAPI = new SectionAPI()
		this.zoneAPI = new ZoneAPI()
		this.commentAPI = new CommentAPI()
		this.announceAPI = new AnnounceAPI();
		this.didFocusSubscription = null;
		this.notificationSubscription = null;
		this.webview = null;
	}

	async componentDidMount() {
		console.log("=====HOME.JS DID MOUNT ========");
		Linking.getInitialURL().then(val =>
			this.handleSchemeLinking(val)
		).catch(e => Sentry.Native.captureException(e))

		this._linkingListener = Linking.addEventListener('url', this.handleUrlChange.bind(this));


		console.log("LOADING USER FROM API FROM HOME.JS");
		if (this.props.user === null) {
			const myUser = await MainUser.loadUserFromApiAsync();
			if (myUser && myUser.code !== -1) {
				console.log("USER LOADDEDDD");
				this.props.dispatch(overwrite(myUser));
			}
		}
		if (this.props.user && this.props.user.id) {
			console.log(this.props.user);
			AnalyticsManager.setUserId(this.props.user.id.toString())
			AnalyticsManager.setUserProperties({ email: this.props.user.email });

			const userZone = await this.getCurrentClosestUserZone();

			if (userZone.slug === "default") {
				const notLiveShownDate = await MainUser.getNotLiveShownDate();
				// A user being in the default zone means we are not live in their local city.
				if (!notLiveShownDate) {
					this.setState({ notLiveVisible: true });
					AnalyticsManager.logEvent(events.USER_SHOWN_NOT_LIVE_POPUP, { ipCity: this.props.ipCity });
				}
			}
			const meetsAppVersion = await this.meetsMinimumAppVersion(userZone);
			if (meetsAppVersion) {
				this.setState({ zone: userZone }, async () => await this.fetchData());
			} else {
				this.setState({ loaded: true });
				return;
			}
			this.maybeSetupPromoterViews(this);
		} else {
			await AsyncStorage.removeItem("token")
			MainUser.clearInstanceToken();
			this.props.dispatch(overwrite(null));
			// this.props.navigation.navigate("OnboardingStack", {screen:"Login"});
		}

		this._appStateListener = AppState.addEventListener('change', (next) => this._handleAppStateChange(next));

		var lastChatViewTime = null

		try {
			const value = await AsyncStorage.getItem('lastChatView');
			var lastChatViewTime = null
			if (value !== null) {
				// Alert.alert(`last chat view time is ${value}`)
				lastChatViewTime = new Date(value)
			} else {
				lastChatViewTime = new Date(year = "2017")
			}

			this.props.dispatch(setLastChatViewTime(lastChatViewTime))
		} catch (error) {
			// Error retrieving data
			console.log("Error when fetching last chat view time")
		}

		this.didFocusSubscription = this.props.navigation.addListener('focus', () => {
			this.handleNotificationBadge();
			AnalyticsManager.logEvent(AnalyticEvents.USER_VIEW_HOME);
			this.fetchData()
		});

		this.notificationSubscription = Notifications.addNotificationReceivedListener(this._handleNotification);
		this.registerForPushNotificationsAsync();
	}

	handleSchemeLinking(url) {
		if (!url || url === "") {
			console.log(`No url entered. Url is ${url}`)
			return;
		}
		let { path, queryParams } = Linking.parse(url);
		if (path) {
			if (path === "Home") {
				if (queryParams.zoneSlug) {
					const zone = this.state.zones.find(e => e.slug === queryParams.zoneSlug)
					if (zone) {
						this.setState({ zone: zone });
						this.fetchData();
						this.scrollViewRef.scrollToOffset({ animated: true, offset: 0 });
					}
				}
			} else {
				this.props.navigation.navigate(path, { ...queryParams });
			}
		}
	}

	handleUrlChange(event) {
		this.handleSchemeLinking(event.url);
	}

	async meetsMinimumAppVersion(startZone) {
		const zone = startZone
		console.error('startZone is ', startZone)
		var zoneSlug = null;
		if (zone) {
			zoneSlug = zone.slug;
		} else {
			console.error('Calling meets minimum app version with no Zone')
		}

		const configResponse = await this.zoneAPI.getConfig(zoneSlug, ["client"]);
		if (!configResponse || configResponse.code === -1) {
			console.error("Failed to load config");
			return true;
		}
		console.log("zone config fetch response", configResponse);
		this.props.dispatch(setAppConfig(configResponse));
		const minAppVersion = configResponse["min_app_version"];
		console.log(`Min app version is: ${minAppVersion}`)
		if (minAppVersion === null || minAppVersion === undefined) {
			return true;
		}

		// const result = compareVersions(minAppVersion, Constants.manifest.version)
		// console.log(`Comparison to ${Constants.nativeAppVersion} is ${result}`)
		// if (result === 1) { 
		// 	this.setState({needsUpdate: true, loaded: true});
		// 	return false;
		// }
		return true;
	}

	handleEventClick(eventData, source) {
		this.props.navigation.navigate('Event', {
			event: eventData,
			source: source
		})
	}

	handleVideoClick(video) {
		console.log(video)
		this.setState({ modalVisible: true, videoUrl: video.url })
	}

	getAdminHeader() {
		return <Button variant={"ghost"} onPress={() => this.props.navigation.navigate('MyEvents', {
			"organizerEvents": this.state.organizerEvents
		})}>
			Admin</Button>
	}

	async getCurrentClosestUserZone() {
		const coordinates = await this.zoneAPI.getCoordinates();
		if (coordinates) {
			this.props.dispatch(setIpCity(coordinates.city))
			// TOOD: Store use coordinates
			const coor = {
				lat: coordinates.lat,
				lon: coordinates.lon
			}

			const zoneFromCoor = await this.zoneAPI.getZoneWithCoordinates(coor);
			console.log('zone api response from coordinates', zoneFromCoor)
			if (zoneFromCoor && zoneFromCoor.code !== -1 && zoneFromCoor.length > 0) {
				const closestZone = zoneFromCoor[0];
				userZone = closestZone.slug;
				if (closestZone !== this.props.user.zone) {
					const userResp = await this.userAPI.partialUpdate(this.props.user.id, { zone_slug: userZone });
					if (userResp && userResp.code !== -1) {
						this.props.dispatch(overwrite(userResp))
					}
				}
				return zoneFromCoor[0];
			} else {
				console.log("Failed to get zone data");
			}
			var zoneDefault = null;
			console.log("Zone data was empty. Now fetching default zone")
			if (zoneFromCoor.length === 0) {
				zoneDefault = await this.zoneAPI.getZone('default');
				console.log('default zone response', zoneDefault)
				if (zoneDefault && zoneDefault.code !== -1) {
					return zoneDefault;
				} else {
					console.log("Failed to get zone data");
				}
			}
		}
	}

	async fetchData() {
		if (this.props.user === null || this.props.user === undefined) {
			console.log("USER IS NULL. RETURNING")
			return
		}
		if (!this.state.zone) {
			Sentry.Native.captureMessage("User with no zone attempting to fetch data");
		}

		const userZone = this.state.zone.slug

		const sectionsResp = await this.sectionAPI.getSections(userZone, "v1", "manual", "tag");
		if (sectionsResp && sectionsResp.code !== -1) {
			this.setState({ sections: sectionsResp });
		} else {
			console.log("Failed to load sections");
		}

		// When sections api is first called, we use the inclusion kind "manual" which means we only 
		// include manual sections on the default zone. If that response is empty, we'll make another request to include
		// all default sections.
		console.log("SECTIONS LENGTH = ", sectionsResp.length)
		if (sectionsResp.length == 0) {
			const defaultSectionsResp = await this.sectionAPI.getSections(userZone, "v1", "all", "tag");
			if (defaultSectionsResp && defaultSectionsResp.code !== -1) {
				this.setState({ sections: defaultSectionsResp });
			}
		}


		this.setState({ loaded: true, refreshing: false, refreshed: !this.state.refreshed });

		const announceResp = await this.announceAPI.getAnnouncement({ zone: userZone });
		if (announceResp && announceResp.code !== -1) {
			this.setState({ announcements: announceResp });
		} else {
			console.log("Failed to get announcement data");
		}

		const curatorsData = await this.curatorAPI.getCurators(userZone);
		if (curatorsData && curatorsData.code !== -1) {
			this.setState({ cityCurators: curatorsData });
		}

		const zoneData = await this.zoneAPI.getZone();
		if (zoneData && zoneData.cpde !== -1) {
			this.setState({ zones: zoneData })
		} else {
			console.log("Failed to load zones");
		}

		const featuredEventsResp = await this.eventAPI.getFeaturedEvents(userZone);
		if (featuredEventsResp && featuredEventsResp.code !== -1) {
			this.setState({ featuredEvents: featuredEventsResp });
		} else {
			console.log("No featured events");
		}


		const commentResp = await this.commentAPI.getChats(userZone);
		if (commentResp && commentResp.code !== -1) {
			var notificationCount = 0
			for (var item of commentResp) {
				const recentComments = item.recent_comments
				for (comment of recentComments) {
					console.log(`last notification is ${this.props.lastChatViewTime}`)
					if (moment(comment.created_at).isAfter(this.props.lastChatViewTime)) {
						notificationCount += 1
					}
				}
			}
			this.props.dispatch(putChatNotificationCount(notificationCount));
		} else {
			console.log("Failed to get chats");
		}


		const storyResp = await this.storyAPI.getStories(userZone)
		if (storyResp && storyResp.code !== -1) {
			this.setState({ stories: storyResp });
		} else {
			console.log("Failed to load stories data");
		}
		this.meetsMinimumAppVersion(this.state.zone);
	}

	async refreshData() {
		this.setState({ refreshing: true })
		await this.fetchData();
		this.maybeSetupPromoterViews(this)
	}

	maybeSetupPromoterViews(obj) {
		if (MainUser.isPromoter()) {
			if (Platform.OS === 'android') {
				obj.props.navigation.setOptions({ headerRight: () => obj.getAdminHeader() })
			} else {
				obj.props.navigation.setOptions({ headerLeft: () => obj.getAdminHeader() })
			}
			console.log("User is a promoter")
			const weakThis = obj
			obj.eventAPI.getOrganizerEvents((data) => {
				// console.log(data)
				weakThis.setState({ organizerEvents: data })
			},
				(error) => console.log("Could not get organizer events. Something went wrong."))
		} else {
			console.log("User is not a promoter.")
		}
	}

	_handleNotification = (notification) => {
		console.log('notification recieved', notification.request.content.body);
		if (notification.request.content.body != null) {
			Toast.show({
				text: notification.request.content.body,
				buttonText: 'Okay',
				position: 'top',
				duration: 3000
			})
		}
	};

	async registerForPushNotificationsAsync() {
		token = await registerForPushNotificationsAsync();
		if (token != null) {
			const result = await this.userAPI.sendPhoneToken(token);
			console.log('notification update result', result);
		}
	}

	async handleNotificationBadge() {
		const badgeNumber = await Notifications.getBadgeCountAsync()
		console.log("badgeNumber IS ")
		console.log(badgeNumber)
		await Notifications.setBadgeCountAsync(0)
	}

	_handleAppStateChange(nextAppState) {
		console.log(`app state is ${this.state.appState}`)
		console.log(`next app state is ${nextAppState}`)

		if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
			this.handleNotificationBadge()
			this.refreshData()
		}
		if (this.state.appState === 'active' && nextAppState.match(/inactive|background/)) {
			if (this.props.lastChatViewTime) {
				try {
					AsyncStorage.setItem('lastChatView', this.props.lastChatViewTime.toString())
					console.log("Successfully wrote to Async Storage")
				} catch (error) {
					console.log("Error saving last time chat was viewed")
					console.log(error)
					Sentry.Native.captureException(error);
				}
			}
		}
		if (this.state) {
			this.setState({ appState: nextAppState });
		}
	}

	componentWillUnmount() {
		this._appStateListener.remove();
		this._linkingListener.remove();

		console.log("HOME UNMOUNTING")
		console.log("STATE IS NOT BROKEN")
		if (this.didFocusSubscription) {
			this.didFocusSubscription();
		}
		if (this.notificationSubscription) {
			Notifications.removeNotificationSubscription(this.notificationSubscription);
		}
		console.log("home is done unmounting")
	}

	getCategoryMap(events) {
		const map = {}

		for (var event of events) {
			if (map[event.kind] === undefined) {
				map[event.kind] = [event]
			} else {
				map[event.kind].push(event)
			}
		}

		return map
	}

	async handleZoneSelection(zone) {
		const userResp = await this.userAPI.partialUpdate(this.props.user.id, { zone_slug: zone.slug });
		console.log(userResp)
		if (userResp && userResp.code !== -1) {
			this.props.dispatch(overwrite(userResp));
			this.setState({ cityPickerVisible: false, zone: zone }, () => this.refreshData());
		} else {
			Alert.alert("Problem selecting zone. Try again later");
		}
	}

	handleCuratorClick(name) {
		AnalyticsManager.logEvent(AnalyticEvents.USER_CLICKED_CURATOR_PROFILE)
		console.log(name)
		const user = this.state.cityCurators.find(function (obj) {
			return obj.username == name
		})
		if (user === undefined) {
			console.log("USER IS UNDEFINED")
			return
		}
		const url = user.curator.instagram

		if (url !== '' && url !== null && url !== undefined) {
			Linking.openURL(url)
		}
	}

	handleSectionSeeMoreClick(section) {
		const sectionKind = section.kind
		AnalyticsManager.logEvent(AnalyticEvents.SECTION_SEE_MORE_CLICK, {
			kind: sectionKind
		})
		if (sectionKind === "automatic_section") {
			this.props.navigation.navigate('Events', {
				events: null,
				kind: section.title,
				zone: this.state.zone.slug
			})
		}
	}

	onAnnouncementClicked(announcement) {
		if (announcement.link === null || announcement.link === undefined) {
			return
		}

		AnalyticsManager.logEvent(AnalyticEvents.ANNOUNCEMENT_CLICKED)
		Linking.openURL(announcement.link)
	}

	handleLoadMore() {
		// No need at the moment.
		console.log("HOME: Calling load more");
		return null;
	}

	_getRenderCell(item) {
		const userZone = MainUser.getZone(this.props.user)
		var zoneLabel = null
		if (!userZone) {
			zoneLabel = "World"
		} else {
			zoneLabel = this.state.zone.name
		}

		if (item == null || item == undefined) {
			return null
		}

		// const sectionHomeView = getConfig(this.state.zone, "client", "section_home_view")

		if (item.index === 0) {
			if (this.state.announcements.length === 0) {
				return null
			} else {
				const announcement = this.state.announcements[0]
				return (
					<TouchableHighlight onPress={() => this.onAnnouncementClicked(announcement)} style={{ backgroundColor: '#8884d8' }}>
						<View style={{ flex: 1, margin: 10 }}>
							<Text style={{ fontWeight: 'bold', color: 'white' }}>{announcement.title}</Text>
							<Text style={{ color: 'white' }}>{announcement.description}</Text>
						</View>
					</TouchableHighlight>
				)
			}
		}
		var events = []
		for (var section of this.state.sections) {
			if (section.item_kind === "event") {
				if (section.items) {
					for (var sectionItem of section.items) {
						var exists = events.find(e => e.id == sectionItem.id)
						if (!exists) {
							events.push(sectionItem)
						}
					}
				}
			}
		}

		// console.log("SECTION EVENTS ARE ======")
		// console.log(events)
		if (item.index == 1) {
			return (
				<View style={{ backgroundColor: "#222323", paddingTop: 10, paddingBottom: 10 }}>
					<SafeAreaView>
						<View style={{ marginLeft: 10, marginRight: 1, flexDirection: 'row' }}>
							<Text mb={1} fontSize={"2xl"} style={{ fontWeight: 'bold', color: 'white', fontSize: 29 }}>What's the move in</Text>
							<TouchableHighlight onPress={() => this.setState({ cityPickerVisible: true })} style={{ marginLeft: 10 }}>
								<View style={{ display: 'flex', flexDirection: 'row' }}>
									<Text fontSize={"2xl"} style={{ fontSize: 29, color: Colors.primaryETAColor, fontWeight: 'bold', paddingLeft: 0 }}
									>{zoneLabel.slice(0, 3)}<Text>...</Text></Text>
									<View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
										<Icon as={Ionicons} name='chevron-down-outline' style={{ color: Colors.primaryETAButtonColor, marginLeft: 5, fontSize: 20 }} />
									</View>
								</View>
							</TouchableHighlight>

						</View>
						<TouchableHighlight onPress={() => this.setState({ cityPickerVisible: true })} style={{ marginLeft: 10 }}>
							<View style={{ display: 'flex', flexDirection: 'row' }}>
								<Text fontSize={"2xl"} style={{ fontSize: 29, color: Colors.primaryETAColor, fontWeight: 'bold', paddingLeft: 0 }}
								>{zoneLabel}</Text>
								<View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
									<Icon as={Ionicons} name='chevron-down-outline' style={{ color: Colors.primaryETAButtonColor, marginLeft: 5, fontSize: 20 }} />
								</View>
							</View>
						</TouchableHighlight>
						<StoryViewCell
							stories={this.getFeatured(events, this.state.stories)}
							handlePress={(item) => {
								if (item.type === "event") {
									this.props.navigation.navigate('Event', {
										eventId: item.id,
										source: "carousel"
									})
								} else {
									Linking.openURL(item.url)
								}
							}}
						/>
					</SafeAreaView>
				</View>
			)
		}

		if (item.index == 2) {
			return <View style={{ paddingTop: 20, paddingBottom: 20, backgroundColor: StylerInstance.getBackgroundColor() }}>
				<View style={{ color: 'black' }}>
					<Heading style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: StylerInstance.getOutlineColor() }}>Your Curators</Heading>
					<Text style={{ textAlign: 'center', color: StylerInstance.choose("gray", 'white') }}>Plugging you to amazing moves and community</Text>
				</View>
				<View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
					{this.state.cityCurators.map((item, index) =>
						<UserViewCell
							key={index}
							user={item}
							username={item.username}
							imageStyle={{ height: 70, width: 70, borderRadius: 70 / 2 }}
							style={{ marginRight: 10 }}
							onClick={(name) => this.handleCuratorClick(name)}
						/>
					)
					}
				</View>

				<View style={{ marginTop: 20 }}>
					<Button colorScheme={"danger"} variant="subtle"
						style={{ width: '40%', alignSelf: 'center', justifyContent: 'center' }}
						onPress={() => Linking.openURL('mailto:curate@witheta.com')}>Hit us up</Button>
				</View>
			</View>
		}

		if (item.index === 3) {
			return <View style={{ backgroundColor: StylerInstance.getBackgroundColor() }}>
				{this.state.sections.map((item, index) => item.items.length > 0 &&
					<Section
						key={item.id}
						style={{ marginBottom: 20 }}
						title={item.title}
						subtitle={item.description}
						items={item.items}
						itemKind={item.item_kind}
						kind={item.kind}
						section={item}
						onSeeMoreClicked={(section) => this.handleSectionSeeMoreClick(section)}
						handleVideoClick={(data) => this.handleVideoClick(data)}
						handleEventClick={(data) => this.handleEventClick(data, "section")}
					/>
				)}
			</View>
		}

		if (item.index === 4) {
			if (this.props.config.iframe_url) {
				return <View style={{ height: 660 }}>
					<WebView originWhitelist={['*']}
						ref={(ref) => (this.webview = ref)}
						javaScriptEnabled={true}
						scalesPageToFit={true}
						scrollEnabled={false}
						setSupportMultipleWindows={false}
						onShouldStartLoadWithRequest={event => {
							console.error("Calling onShouldStartLoadWithRequest", event)
							const url = event.url
							return true
						}}
						source={{ uri: this.props.config.iframe_url }} />
				</View>
			} else {
				return null
			}
		}

		if (item.index === 5) {
			return <View>
				<RatingView />
				<View style={styles.buttonViewStyle}>
					<Button onPress={() => {
						AnalyticsManager.logEvent(AnalyticEvents.USER_SHARED_APP, { source: 'homepage' })
						var url = "https://eta.app.link/share-download"
						var message = "I'm on ETA come discover & explore experience.The best experience in Los Angeles with me."
						Share.share({
							message: message,
							url: url
						})
					}}
						style={styles.buttonStyle}>
						<Text style={{ color: 'white' }}>Share with Friends</Text>
					</Button>
				</View>
				<View style={styles.buttonViewStyle}>
					<Button colorScheme={"warning"} onPress={() => {
						AnalyticsManager.logEvent(AnalyticEvents.USER_LOADED_MORE_EVENTS, { source: 'homepage' })
						this.props.navigation.navigate("Events")
					}
					}
						style={styles.buttonStyle}
					>See more events
					</Button>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', width: '20%', justifyContent: 'space-between' }}>
					<TouchableOpacity style={{ backgroundColor: '#fff', borderRadius: 5 }} onPress={() => { Linking.openURL('https://www.instagram.com/eta.hq/') }}>
						<Image style={{ height: 40, width: 40 }} resizeMode='contain' source={require('../assets/images/insta.png')} />
					</TouchableOpacity>
					<TouchableOpacity style={{ backgroundColor: '#fff', borderRadius: 5 }} onPress={() => { Linking.openURL('https://twitter.com/i/flow/login?redirect_after_login=%2Feta.hq%2F') }}>
						<Image style={{ height: 40, width: 40 }} resizeMode='contain' source={require('../assets/images/twitter.png')} />
					</TouchableOpacity>
				</View>
			</View>
		}
	}

	getFooterView() {
		if (this.state.refreshing) {
			return <Spinner />
		}
	}

	render() {
		StylerInstance.setAppearance(this.props.theme);
		const statusBar = <StatusBar style={StylerInstance.choose("dark", "light")} />

		if (this.state.loaded == null) {
			return (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					{statusBar}
					<Spinner />
				</View>
			)
		}

		const videoPlayer = this.getVideoPlayer()
		return (
			<View style={{ backgroundColor: backgroundColor, flex: 1 }}>
				{statusBar}
				{videoPlayer}
				<CityPickerModal
					zones={this.state.zones}
					visible={this.state.cityPickerVisible}
					onExit={() => this.setState({ cityPickerVisible: false })}
					onZoneSelect={(zone) => this.handleZoneSelection(zone)}
				/>
				<FlatList
					ref={ref => { this.scrollViewRef = ref }}
					data={this.state.dummy}
					extraData={this.state.refreshed}
					renderItem={(item) => this._getRenderCell(item)}
					refreshControl={
						<RefreshControl
							refreshing={this.state.refreshing}
							onRefresh={this.refreshData.bind(this)}
							title="Pull to refresh"
							tintColor={StylerInstance.choose('#0000ff', 'white')}
							titleColor={StylerInstance.choose('#0000ff', 'white')}
						/>
					}
					ListFooterComponent={() => <View style={{ marginTop: '5%', marginBottom: '5%', alignItems: 'center', justifyContent: 'center' }}>
						{this.getFooterView()}
					</View>}
					onEndReachedThreshold={0.1}
					onEndReached={() => this.handleLoadMore()}
				/>

				<NewProductModal
					productKey="event_submit"
					entries={[
						{
							title: 'Introducing Event Submit!',
							data: "You can now submit events to ETA directly through the app! The 'My tickets' page has been moved to the profile page.",
						}
					]}
				/>

				<SimplePopup
					buttonTitle="Update"
					onButtonPress={() => {
						if (Platform.OS === "ios") {
							Linking.openURL("https://apps.apple.com/us/app/gameplan-plug-into-nightlife/id1448003243?ls=1");
						} else {
							Linking.openURL("https://play.google.com/store/apps/details?id=com.victoranyirah.Gameplan");
						}
					}}
					visible={this.state.needsUpdate}
					title={"You're app is out of date"}
					data={"Please update to continue to use ETA"}
					onExit={() => console.log("Exited")}
				/>


				<SimplePopup
					buttonTitle="Okay"
					onButtonPress={() => this.handleNotLiveExit()}
					visible={this.state.notLiveVisible}
					title={`ETA isn't live in your city yet`}
					data={`We're working hard to bring ETA to ${this.props.ipCity} but we aren't there yet. Check out one of our other cities or you can help us launch by submitting events for your city through the app! For now, we'll help you discover online events for the culture 🍾`}
					onExit={() => this.handleNotLiveExit()}
				/>

			</View>
		);
	}

	async handleNotLiveExit() {
		await MainUser.setNotLiveShownDate();
		this.setState({ notLiveVisible: false })
	}

	getVideoPlayer() {
		return (<VideoPlayer
			visible={this.state.modalVisible}
			videoUrl={this.state.videoUrl}
			onExitClick={() => this.setState({ modalVisible: false })}
		/>)
	}

	getFeatured(events, articles) {
		// Featured are the 3 newest stories and 5 highest ranking events
		if (events == undefined || articles == undefined || articles.slice === undefined) {
			return ["/static/background3.jpg", "/static/background.jpg", "/static/background2.jpg"]
		} else {
			console.log("Getting featured events and stories")
			const map = events.slice()
			map.sort(function (a, b) { return a.rank - b.rank })
			const featuredArticles = articles.slice(0, 2)
			const featured = []

			for (let i = 0; i < 8; i++) {
				if (i % 2 == 0) {
					const val = map.pop()
					if (val !== undefined) {
						const userTimeZone = getTimeZone(this.props.user)
						const subheading = moment.tz(val.start_date, userTimeZone).format('ddd MMM Do, h:mm a') + " at " + val.place

						const entry = {
							caption: val.title,
							subheading: subheading,
							image: val.image_url,
							type: 'event',
							id: val.id,
							url: "https://www.witheta.com/event/" + val.id
						}
						featured.push(entry)
					}
				} else {
					const article = featuredArticles.pop()
					if (article !== undefined) {
						const entry = {
							caption: article.title,
							image: article.image_url,
							type: 'article',
							id: article.id,
							subheading: article.subheading,
							url: 'https://www.witheta.com/story/' + article.id
						}
						featured.push(entry)
					}
				}
			}

			console.log(featured)
			return featured
		}
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black'
	},
	video: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
	},
	content: {
		flex: 1,
		margin: 10
	},
	buttonViewStyle: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginBottom: 10
	},
	buttonStyle: {
		width: '70%',
		justifyContent: 'center'
	}
});

const mapStateToProps = (state) => {
	const { user, theme, lastChatViewTime, config, ipCity } = state
	return { user, theme, lastChatViewTime, config, ipCity }
}

export default connect(mapStateToProps)(HomeScreen)

