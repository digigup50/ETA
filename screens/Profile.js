import React, { Component } from 'react';
import { View, Text, TouchableHighlight, Alert, ScrollView, Image, Share, Platform, Modal, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Input, Button, Switch, FormControl } from 'native-base'
import { Image as CachedImage } from "react-native-expo-image-cache";
import MainUser from '../components/MainUser';
import ImageAPI from '../api/ImageAPI';
import { AnalyticsManager, events } from '../api/Analytics';
import { ImagePicker } from 'expo-image-picker';
import * as Permissions from 'expo-permissions'
import { connect } from 'react-redux'
import { overwrite, setUser } from '../store'
import AsyncStorage from '@react-native-async-storage/async-storage';
import StylerInstance from '../managers/BaseStyler';
import BaseApiConfigProvider from '../managers/BaseApiConfigProvider'
import AppThemeCheckBox from '../components/AppThemeCheckBox'
import Constants from 'expo-constants';
import InternalConfig from '../constants/InternalConfig';
import UserAPI from '../api/UserAPI';
import Popup from '../components/Popup';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


class ProfileScreen extends Component {


	constructor(props) {
		super(props)
		this.state = {
			image: null,
			imageAPI: new ImageAPI(),
			subscription: null,
			loaded: false,
			allowDms: this.props.user.allow_dm
		}
		this.userApi = new UserAPI();
	}

	async fetchData() {
		console.log("LOADING USER DATA FROM API VIA PROFILE.JS");
		const userData = await MainUser.loadUserFromApiAsync();
		if (userData && userData.code !== -1) {
			this.props.dispatch(overwrite(userData))
			this.setState({ user: userData })
		} else {

		}
	}

	componentDidMount() {
		console.error(this.props.user.allow_dm)
		const didFocusSubscription = this.props.navigation.addListener(
			'focus',
			payload => {
				AnalyticsManager.logEvent(events.USER_VIEWED_PROFILE)
				this.fetchData();
			}
		)
		this.setState({ subscription: didFocusSubscription })
	}

	componentWillUnmount() {
		console.log("==============COMPONENT IS UNMOUNTING ===============")
		const subscription = this.state.subscription
		console.log("REMOVING subscription")
		subscription();
	}

	handleEditPressed() {
		this.props.navigation.navigate("Edit")
	}

	getImage() {
		if (this.props.user == null) {
			return null
		}

		if (this.state.image != null) {
			return this.state.image
		}

		var imageUri = null;
		if (this.props.user.image_url) {
			imageUri = this.props.user.image_url
		} else if (this.props.user.profile_image && this.props.user.profile_image.image) {
			imageUri = this.props.user.profile_image.image;
		}

		if (!imageUri) {
			return (<Image source={require('../assets/images/person.png')} style={styles.avatarStyle} />)
		} else {
			return (<CachedImage uri={imageUri} style={styles.avatarStyle} />)
		}
	}

	getStaffView() {
		if (this.props.user.is_staff) {
			return (<View style={styles.buttonViewStyle}>
				<Button onPress={() =>
					this.handleEnvChange()}
					style={styles.buttonStyle}>
					<Text style={{ color: 'white' }}>Change Env</Text>
				</Button>

				<Button onPress={async () => await AsyncStorage.multiRemove(["notLiveShownDate"])}
					style={styles.buttonStyle}>
					<Text style={{ color: 'white' }}>Clear local cache</Text>
				</Button>
			</View>)
		}

		return null
	}

	async _handleLogout() {
		AnalyticsManager.logEvent(events.USER_LOGGED_OUT)
		await AsyncStorage.removeItem("token")
		MainUser.clearInstanceToken();
		this.props.dispatch(overwrite(null));
		console.log("FINISHING LOGOUT");
		// this.props.navigation.navigate("OnboardingStack", {screen:"Login"});
	}

	handleEnvChange() {
		Alert.alert(
			"Select environment",
			"Go 'head then dev.",
			[
				{ text: 'DEV', onPress: () => BaseApiConfigProvider.changeEnv("DEV") },
				{ text: 'STAGE', onPress: () => BaseApiConfigProvider.changeEnv("STAGE") },
				{ text: 'PROD', onPress: () => BaseApiConfigProvider.changeEnv("PROD") },
			],
			{ cancelable: false }
		)
	}

	getLogOutView() {
		return <View style={[styles.buttonViewStyle, { marginTop: '30%' }]}>
			<Button onPress={() =>
				this._handleLogout()}
				style={[styles.buttonStyle, { backgroundColor: '#000', height: 50, width: '90%' }]}>
				<Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Log out</Text>
			</Button>
		</View>
	}

	handleShare() {
		const options = {
			message: "I'm on ETA come discover & explore experience.The best experience in Los Angeles with me.",
			title: 'Hello'
		};
		AnalyticsManager.logEvent(events.USER_SHARED_APP, { source: 'profile' })
		var url = "https://apps.apple.com/us/app/gameplan-plug-into-nightlife/id1448003243?ls=1"
		if (Platform.OS === "android") {
			url = "https://play.google.com/store/apps/details?id=com.victoranyirah.Gameplan"
		}

		Share.share({
			message: options.message,
			url: url,
			title: options.title
		})
	}

	getMyTicketsView() {
		return <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', alignSelf: 'center', marginTop: '5%' }} onPress={() => this.props.navigation.navigate("MyTickets")}>

			<Text style={{ fontWeight: '700', color: StylerInstance.getOutlineColor(), fontSize: 16 }}>My tickets</Text>

			<MaterialIcons name='arrow-forward-ios' size={24} color={StylerInstance.getOutlineColor()} />
		</TouchableOpacity>
	}

	getShareView() {
		return <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', alignSelf: 'center', marginTop: '5%' }} onPress={() =>
			this.handleShare()}>

			<Text style={{ fontWeight: '700', color: StylerInstance.getOutlineColor(), fontSize: 16 }}>Share with Friends</Text>

			<MaterialIcons name='arrow-forward-ios' size={24} color={StylerInstance.getOutlineColor()} />
		</TouchableOpacity>
	}

	getBlockedUsersView() {
		return <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', alignSelf: 'center', marginTop: '5%' }} onPress={() => this.props.navigation.navigate("BlockList")}>

			<Text style={{ fontWeight: '700', color: StylerInstance.getOutlineColor(), fontSize: 16 }}>Block list</Text>

			<MaterialIcons name='arrow-forward-ios' size={24} color={StylerInstance.getOutlineColor()} />
		</TouchableOpacity>
	}

	getVersionString() {
		// var string = `${Constants.manifest.version}-${InternalConfig.internalSdk}`
		// if (Constants.manifest.releaseChannel) {
		// 	string += `-${Constants.manifest.releaseChannel}`;
		// }
		return "v49";
	}

	getView() {
		const user = this.props.user
		StylerInstance.setAppearance(this.props.theme);
		if (this.props.user == null) {
			return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: StylerInstance.getBackgroundColor() }}>
				<Text style={{ marginBottom: 20, color: StylerInstance.getOutlineColor() }}> No User found. </Text>
				{this.getLogOutView()}
			</View>)

		}
		return (
			<ScrollView contentContainerStyle={{ backgroundColor: StylerInstance.getBackgroundColor() }}>
				<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
					{this.getImage()}
				</View>
				{/* 
				<Form >
					<Item fixedLabel>
						<Label style={{ color: StylerInstance.getOutlineColor() }}>Username</Label>
						<Input disabled placeholder={this.props.user.username} />
					</Item>
					<Item fixedLabel last disabled>
						<Label style={{ color: StylerInstance.getOutlineColor() }}>Email</Label>
						<Input disabled placeholder={this.props.user.email} />
					</Item>
				</Form> */}

				{/* <FormControl pr={2} pl={2}>
					<FormControl.Label style={{ color: StylerInstance.getOutlineColor() }}>Username</FormControl.Label>
					<Input size="lg" disabled variant={"underlined"} placeholder={this.props.user.username} />

					<FormControl.Label style={{ color: StylerInstance.getOutlineColor() }}>Email</FormControl.Label>
					<Input size="lg" disabled variant={"underlined"} placeholder={this.props.user.email} />
				</FormControl> */}

				<View style={{ alignSelf: 'center', marginTop: '10%', alignItems: 'center' }}>
					<Text style={{ fontWeight: '700', color: StylerInstance.getOutlineColor() }}>{this.props.user.username}</Text>
					<Text style={{ fontWeight: '700', color: 'blue', marginTop: 10 }}>{this.props.user.email}</Text>
				</View>


				<AppThemeCheckBox style={{ marginTop: 20 }} />

				<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 20 }}>
					<Text style={{ color: StylerInstance.getOutlineColor() }}>Allow DMs</Text>
					<Switch
						trackColor={{ false: "#767577", true: "green" }}
						thumbColor={StylerInstance.choose("#f4f3f4", "white")}
						ios_backgroundColor="#3e3e3e"
						onValueChange={async () => {
							const newVal = !this.state.allowDms
							this.setState({ allowDms: newVal });
							const userResp = await this.userApi.partialUpdate(MainUser.getUserId(), { allow_dm: newVal });
							if (!userResp || userResp.code == -1) {
								Alert.alert("Failed to update direct message setting. Please try again later");
								this.setState({ allowDms: !newVal });
							}
						}}
						value={this.state.allowDms}
					/>
				</View>

				<View style={{ marginTop: 20 }}>
					{/* <View style={styles.buttonViewStyle}>
						<Button onPress={() =>
							this.handleEditPressed()}
							style={styles.buttonStyle}>
							<Text style={{ color: 'white' }}>Edit</Text>
						</Button>
					</View> */}

					<TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', alignSelf: 'center', marginTop: '5%' }} onPress={() =>
						this.handleEditPressed()}>

						<Text style={{ fontWeight: '700', color: StylerInstance.getOutlineColor(), fontSize: 16 }}>Edit</Text>

						<MaterialIcons name='arrow-forward-ios' size={24} color={StylerInstance.getOutlineColor()} />
					</TouchableOpacity>

					{this.getShareView()}

					{this.getMyTicketsView()}

					{this.getBlockedUsersView()}

					{this.getLogOutView()}

					{this.getStaffView()}

					<View style={{ marginBottom: 20, marginTop: 20 }}>
						<Text style={{ textAlign: 'center', color: StylerInstance.getOutlineColor() }}>{`version: ${this.getVersionString()}`}</Text>
					</View>

				</View>
				{/* <Popup visible height="20%" width="50%">
					<ActivityIndicator color={"black"}></ActivityIndicator>
				</Popup> */}
			</ScrollView>
		)
	}

	render() {
		return this.getView()
	}
}


const styles = {

	avatarStyle: {
		width: 120, height: 120, borderRadius: 120 / 2, borderWidth: 5, borderColor: 'white', marginTop: 10
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
}

const mapStateToProps = (state) => {
	const { user, theme } = state
	return { user, theme }
}

export default connect(mapStateToProps)(ProfileScreen)