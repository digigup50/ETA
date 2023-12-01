import React from 'react'
import { View, FlatList, ScrollView, AppState, Alert, Image, TouchableOpacity, TextInput, SafeAreaView, Platform } from 'react-native'
import EventListView from '../components/EventListView'
import VideoPlayer from '../components/VideoPlayer'
import EventAPI from '../api/EventAPI';
import { AnalyticsManager, events } from '../api/Analytics'
import { connect } from 'react-redux'
import { Badge, Heading } from 'native-base'
import MainUser from '../components/MainUser'
import { Ionicons } from '@expo/vector-icons'
import { Button, Text, Spinner } from 'native-base'
import EventFilterModal from '../components/EventFilterModal'
import { getConfig } from '../managers/UtilsManager'
import StylerInstance from '../managers/BaseStyler';
import TagAPI from '../api/TagAPI';
import SearchAPI from '../api/SearchAPI';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';



class EventsScreen extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			loading: true,
			videoUrl: '',
			modalVisible: false,
			mockData: [{ key: 'filter' }, { key: 'events' }],
			events: [],
			canFetch: false,
			appState: AppState.currentState,
			refreshing: false,
			refreshed: false,
			zone: null,
			kind: null,
			time: null,
			filterVisible: false,
			filterCategories: [],
			filterTags: [],
			subscriptions: [],
			filterTime: null,
			lastScrollTime: null,
			lastFetchTime: null,
			limit: 25,
			page: 1,
			clickedEvent: false,
			search: '',
			tags: [],

			isDatePickerVisible: false,
			selectedDate: null,
		}
		this.eventAPI = new EventAPI();
		this.tagAPI = new TagAPI();
		this.searchAPI = new SearchAPI();
	}

	async componentDidMount() {
		this.props.navigation.setParams({ headerLeft: null, header: this.getSearchComponent() })
		console.log('events', this.props)
		const pageEvents = this.props.route.params && this.props.route.params.events !== undefined ? this.props.route.params.events : null
		this.setState({ loading: true, canFetch: false, refreshing: false })
		const didFocusSubscription = this.props.navigation.addListener(
			'focus',
			payload => {
				AnalyticsManager.logEvent(events.USER_VIEW_CALENDAR)
				if (this.state.clickedEvent) {
					this.setState({ clickedEvent: false })
				} else {
					const kind = this.props.route.params && this.props.route.params.kind || null;
					this.setState({ kind: kind }, () => {
						this.refreshData()
					})
				}
			}
		)

		const newSubscriptions = this.state.subscriptions
		newSubscriptions.push(didFocusSubscription)
		this.setState({ subscriptions: newSubscriptions });

		if (pageEvents == null) {
			console.log('props ==>>>', this.props)
			console.log("No event is passed in")
			this._appStateListener = AppState.addEventListener('change', (next) => this._handleAppStateChange(next));

			var zone = this.props.route.params && this.props.route.params.zone || null;
			const kind = this.props.route.params && this.props.route.params.kind || null;
			this.setState({ kind: kind })
			this.fetchData(kind)
		} else {
			this.setState({ events: pageEvents, refreshing: false, refreshed: !this.state.refreshed, canFetch: true })
		}

		const tags = await this.tagAPI.getTags();
		if (tags && tags.code !== -1) {
			this.setState({ tags: tags.results });
		}
	}


	resetFilter = () => {
		this.setState(
			{
				filterCategories: [],
				filterTags: [],
				filterTime: null,
			},
			() => {
				this.refreshData();
			}
		);
	};



	handleDateSelect = (date) => {
		var myformat = "MMM DD";
		var mDate = moment(date).format(myformat);
		alert(mDate)

		this.setState({ selectedDate: mDate, isDatePickerVisible: false }, () => {
			this.refreshData();
		});
	};






	async componentDidUpdate(prevProps) {
		if (prevProps.user !== this.props.user) {
			this.fetchData(this.state.kind);
		}
	}

	async fetchData(kind) {
		const weakThis = this
		zone = MainUser.getZoneSlug(this.props.user)
		var requestBody = {
			zone: zone,
			category: kind,
			limit: this.state.limit,
			expansions: 'tag'
		}
		if (this.state.search !== '') {
			requestBody.search = this.state.search;
		}
		console.log(this.state.filterCategories)
		if (this.state.filterCategories !== null && this.state.filterCategories.length !== 0) {
			console.log("FILTER CATEGORIES ARE NOT NULL")
			requestBody.category = this.state.filterCategories.toString()
		}

		var eventData = null;


		if (this.state.filterTags.length > 0) {
			console.log("Tag filtering is active. Using search api");
			const searchTags = this.state.filterTags.map((item, index) => item.identifier);
			const searchResults = await this.searchAPI.search({
				tags: searchTags, expansions: requestBody.expansions, query: requestBody.search,
				categories: requestBody.category, zoneSlug: zone
			});
			if (searchResults && searchResults.code !== -1) {
				eventData = searchResults.results.map((item, index) => item.event)
			}
		} else {
			console.log(requestBody)
			eventData = await this.eventAPI.getUpcomingEvents(requestBody);
		}

		console.log('eventData', eventData)
		if (eventData && eventData.code !== -1 && eventData.length) {
			weakThis.setState({
				events: eventData,
				loading: false,
				refreshing: false,
				refreshed: !weakThis.state.refreshed,
				canFetch: eventData.length === weakThis.state.limit,
				lastFetchTime: new Date()
			})
		} else {
			console.log("RECIEVED ERROR WHEN LOADING MORE EVENTS")
			if (weakThis.state.events.length === 0) {
				Alert.alert(
					"Connection Error",
					"Sorry we couldn't retrieve new events. Try again later"
				)
			}
			weakThis.setState({ loading: false, refreshing: false, canFetch: true })
		}
	}

	async handleLoadMore() {
		console.log("calling load more")

		console.log(`can fetch is: ${this.state.canFetch}`)
		console.log(`last scroll time is; ${this.state.lastScrollTime}`)
		console.log(`last fetch time is: ${this.state.lastFetchTime}`)

		if (this.state.canFetch === false || this.state.lastScrollTime === null || this.state.lastFetchTime === null) {
			console.log("Can't load more at the moment. Refreshing to try again later tho")
			this.setState({ refreshed: !this.state.refreshed })
			return
		}

		const timeSinceLastFetch = Math.abs(new Date() - this.state.lastFetchTime) / 1000
		if (timeSinceLastFetch < 0.3) {
			console.log("Can't load more. Needs at least 1 second since last fetch time. Will refresh to allow re-firing.")
			this.setState({ refreshed: !this.state.refreshed })
			return
		}


		AnalyticsManager.logEvent(events.USER_LOADED_MORE_EVENTS)
		this.setState({ refreshing: true, canFetch: false })
		const weakThis = this
		zone = MainUser.getZoneSlug(this.props.user)

		const loadMoreBody = {
			zone: zone,
			category: this.state.kind,
			offset: this.state.events.length,
			limit: this.state.limit,
			expansions: 'tag'
		}

		if (this.state.filterCategories.length > 0) {
			loadMoreBody.category = this.state.filterCategories.toString()
		}
		var eventData = null;
		if (this.state.filterTags.length > 0) {
			const filterTags = this.state.filterTags.map((item, index) => item.identifier);
			const searchResponse = await this.searchAPI.search({
				tags: filterTags, categories: loadMoreBody.category,
				expansions: requestBody.expansions, page: this.state.page + 1, zoneSlug: zone
			});
			if (searchResponse && searchResponse.code !== -1) {
				eventData = searchResponse.results.map((item, index) => item.event);
				if (eventData.length > 0) {
					this.setState({ page: this.state.page + 1 })
				}
			}
		} else {
			eventData = await this.eventAPI.getUpcomingEvents(loadMoreBody);
		}
		if (eventData && eventData.code !== -1) {
			if (eventData.length === 0) {
				console.log("Date being returned is empty.")
				weakThis.setState({ refreshing: false, loading: false, canFetch: false, lastFetchTime: new Date() })
				return
			}

			const existingIds = weakThis.state.events.map((item, index) => item.id)
			let difference = eventData.filter(item => !existingIds.includes(item.id));

			const newEvents = weakThis.state.events.concat(difference)

			weakThis.setState({
				events: newEvents,
				loading: false,
				refreshing: false,
				canFetch: eventData.length === weakThis.state.limit,
				lastFetchTime: new Date(),
				refreshed: !weakThis.state.refreshed
			})
		} else {
			Alert.alert(
				"Connection Error",
				"Sorry we couldn't retrieve new events. Try again later"
			)
			weakThis.setState({ loading: false, refreshing: false, canFetch: true, refreshed: !weakThis.state.refreshed })
		}
	}

	refreshData() {
		console.log("REFRESHING DATA...")
		this.setState({ refreshing: true })
		this.fetchData(this.state.kind)
		this.props.navigation.setParams({ headerLeft: null, header: this.getSearchComponent() })

	}

	getSearchComponent(props) {
		if (props) {
			Alert("Props are here");
		}
		const darkThemeBackgroundColor = Platform.OS === "android" ? "#222323" : null

		const total = [...this.state.filterCategories]
		return <SafeAreaView style={{ width: '100%', height: total.length === 0 && this.state.filterTime === null ? 100 : 150, backgroundColor: StylerInstance.getBackgroundColor() }}>
			<View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: StylerInstance.choose("white", darkThemeBackgroundColor), paddingTop: Platform.OS === "android" ? 30 : 0 }}>
				<View style={{ flex: 3 }}>
					<TextInput
						placeholderTextColor={StylerInstance.getOutlineColor()}
						placeholder='Search..'
						onChangeText={this.handleSearchText}
						style={{ color: StylerInstance.getOutlineColor(), width: '100%', height: 40, marginLeft: 10, borderColor: 'gray', borderWidth: 1, borderRadius: 8, paddingLeft: 10 }}
					/>
				</View>
				<View style={{ flex: 1 }}>
					<Button style={{ alignSelf: 'flex-end' }} variant="ghost" onPress={() => {
						AnalyticsManager.logEvent(events.FILTER_CLICK)
						this.setState({ filterVisible: true })
					}}>Filter</Button>
				</View>
			</View>
			<View>
				{this.getActiveFilter()}
			</View>
		</SafeAreaView>
	}

	handleSearchText = (text) => {
		this.setState({ search: text }, () => {
			if (this.state.search.length >= 3) {
				this.fetchData(this.state.kind)
			} else if (this.state.search === '') {
				this.fetchData(this.state.kind)
			}
		})
	}

	// getActiveFilter() {
	// 	const total = [...this.state.filterCategories]
	// 	if (this.state.filterTags && this.state.filterTags.length > 0) {
	// 		for (var tag of this.state.filterTags) {
	// 			total.unshift(tag.label)
	// 		}
	// 	}
	// 	if (this.state.filterTime !== null) {
	// 		total.unshift(this.state.filterTime)
	// 	}
	// 	return <View style={{ paddingTop: 10, paddingBottom: 10, paddingLeft: 3, backgroundColor: StylerInstance.getBackgroundColor(), flexDirection: 'row', justifyContent: 'space-between' }}>
	// 		<ScrollView horizontal showsHorizontalScrollIndicator={false}>
	// 			{/* {total.map((item, index) =>
	// 				<View style={{ marginRight: 3 }} >
	// 					<Badge primary
	// 						key={item}><Text>{item}</Text></Badge></View>
	// 			)} */}

	// 			{total.map((item, index) => (
	// 				<TouchableOpacity
	// 					key={item}
	// 					onPress={() => {
	// 						// Check if the badge represents the calendar
	// 						if (item === 'Calendar') {
	// 							// Add your code to open the calendar here
	// 							// For example, you can navigate to a calendar screen
	// 							this.props.navigation.navigate('CalendarScreen'); // Replace 'CalendarScreen' with your actual calendar screen name
	// 						}
	// 					}}
	// 					style={{ marginRight: 3 }}>
	// 					<Badge primary>
	// 						<Text>{item}</Text>
	// 					</Badge>
	// 				</TouchableOpacity>
	// 			))}
	// 		</ScrollView>
	// 		{total.length > 0 &&
	// 			<Button variant="ghost" onPress={() => { this.resetFilter() }}>Clear Filter</Button>
	// 		}
	// 	</View>
	// }


	getActiveFilter() {
		const total = [...this.state.filterCategories];
		if (this.state.filterTags && this.state.filterTags.length > 0) {
			for (var tag of this.state.filterTags) {
				total.unshift(tag.label);
			}
		}
		if (this.state.filterTime !== null) {
			total.unshift(this.state.filterTime);
		}

		return (
			<View
				style={{
					paddingTop: 10,
					paddingBottom: 10,
					paddingLeft: 3,
					backgroundColor: StylerInstance.getBackgroundColor(),
					flexDirection: 'row',
					justifyContent: 'space-between',
				}}>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					{total.map((item, index) => (
						<TouchableOpacity
							key={item}
							onPress={() => {
								this.setState({ isDatePickerVisible: true });
							}}>
							<View style={{ marginRight: 3 }}>
								<Badge primary>
									<Text>{item}</Text>
								</Badge>
							</View>
						</TouchableOpacity>
					))}
				</ScrollView>
				{total.length > 0 && (
					<Button variant="ghost" onPress={this.resetFilter}>
						Clear Filter
					</Button>
				)}


			</View>
		);
	}






	_getRenderCell(item) {

		console.log('index', item)
		if (item.index === 0) {
			return <EventListView
				style={{ backgroundColor: StylerInstance.getBackgroundColor(), marginTop: 10, }}
				events={this.state.events}
				onEventClicked={(data) => {
					this.setState({ clickedEvent: true })
					this.props.navigation.navigate("Event", { eventId: data.id, source: "calendar" })
				}
				}
				onVideoClick={(video) => this.handleVideoClick(video)}
				extraData={this.state.refreshed}
			/>
		}
	}

	handleVideoClick(video) {
		this.setState({ videoUrl: video.url, modalVisible: true })
	}


	_handleAppStateChange(nextAppState) {
		if (!this.state) {
			return;
		}

		console.log(`app state is ${this.state.appState}`)
		console.log(`next app state is ${nextAppState}`)

		if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
			this.setState({ refreshed: !this.state.refreshed }, () => this.refreshData())
		}

		this.setState({ appState: nextAppState });
	}

	componentWillUnmount() {
		this._appStateListener.remove();
		const subs = this.state.subscriptions
		for (var i = 0; i < subs.length; i++) {
			sub = subs[i]
			if (sub && typeof sub === "function") {
				sub();
			}
		}
	}

	getFooterView() {
		if (this.state.refreshing) {
			return <Spinner />
		}
	}

	getExtraData() {
		var user = "null"
		if (this.props.user.zone !== null) {
			user = this.props.user.zone.slug
		}
		return this.state.refreshed
	}

	render() {
		//TODO: Use flat list rather than section list.
		if (this.state.loading === true || !this.props.user) {
			return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<Spinner />
			</View>
		}

		return (
			<View style={{ backgroundColor: StylerInstance.getBackgroundColor() }}>
				<FlatList
					contentContainerStyle={{ backgroundColor: StylerInstance.getBackgroundColor() }}
					data={this.state.mockData}
					extraData={this.state.refreshed}
					renderItem={(item) => this._getRenderCell(item)}
					onRefresh={() => this.refreshData()}
					refreshing={this.state.refreshing}
					onEndReachedThreshold={0.1}
					onEndReached={() => this.handleLoadMore()}
					ListFooterComponent={() => <View style={{ marginTop: '5%', marginBottom: '5%', alignItems: 'center', justifyContent: 'center' }}>
						{this.getFooterView()}
					</View>}
					onScrollBeginDrag={() => this.setState({ lastScrollTime: new Date() })}
				/>

				<VideoPlayer
					visible={this.state.modalVisible}
					videoUrl={this.state.videoUrl}
					onExitClick={() => this.setState({ modalVisible: false })}
				/>

				<EventFilterModal
					visible={this.state.filterVisible}
					onExit={() => this.setState({ filterVisible: false })}
					tags={this.state.tags}
					options={getConfig(this.props.user && this.props.user.zone, "client", "categories")}
					onFinish={(categories, time, tags) => {
						const tagIdentifiers = tags.map((item, index) => item.identifier);
						AnalyticsManager.logEvent(events.FILTER_APPLY, { categories: categories, tags: tagIdentifiers })
						this.setState({ filterCategories: categories, filterTags: tags, filterTime: time, filterVisible: false, refreshed: !this.state.refreshed }, () => {
							this.refreshData()
						})
					}}
				/>
				{/* Calendar Popup */}
				<DateTimePickerModal
					isVisible={this.state.isDatePickerVisible}
					mode="date"
					onConfirm={(date) => this.handleDateSelect(date)}
					onCancel={() => this.setState({ isDatePickerVisible: false })}
				/>
			</View>
		)
	}

}

const mapStateToProps = (state) => {
	const { user } = state
	return { user }
}

export default connect(mapStateToProps)(EventsScreen)