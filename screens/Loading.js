import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';
import UserAPI from '../api/UserAPI';
import MainUser from '../components/MainUser';
import { AnalyticsManager, events } from '../api/Analytics';
import BaseApiConfigProvider from '../managers/BaseApiConfigProvider'
import { connect } from 'react-redux'
import { overwrite } from '../store';
class LoadingScreen extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			loaded: 'false'
		}
	}

	handleButtonPress() {
		this.props.navigation.navigate('App');
	}

	async componentDidMount() {
		console.log("whats poppin")
		AnalyticsManager.logEvent(events.APP_OPEN)
		console.log("LOADING ENV PREFERENCE")
		await BaseApiConfigProvider.loadUserEnvPreference();
		if (!this.props.user) {
			MainUser.loadTokenFromMemory(async (token) => {
				console.log("Token is..")
				console.log(token)
				if (token == null) {
					this.setState({ loaded: 'true' });
					console.log("NAVIGATING TO LOGIN SCREEN");
					this.props.navigation.navigate('OnboardingStack', { screen: 'Login' });
				} else {
					console.log("LOADING USER VIA LOADING.JS FOR OVERWRITE");
					this.setState({ loaded: 'false' });
					const user = await MainUser.loadUserFromApiAsync();
					this.props.dispatch(overwrite(user));
				}
			})
		}
	}

	render() {
		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}></View>
		);
	}
}

const mapStateToProps = (state) => {
	const { user, lastChatViewTime } = state
	return { user, lastChatViewTime }
}

export default connect(mapStateToProps)(LoadingScreen);