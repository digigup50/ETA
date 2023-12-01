import React, { Component } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { connect } from 'react-redux';
import { AnalyticsManager, events } from '../api/Analytics';
import MainUser from '../components/MainUser';
import BaseStyler from '../managers/BaseStyler';
import CustomNavBar from './CustomNavBar';

class SubmitScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			url: null,
			loaded: false,
		};
		this.didFocusSubscription = null;
	}

	componentDidMount() {
		this.didFocusSubscription = this.props.navigation.addListener('focus', () => {
			AnalyticsManager.logEvent(events.USER_VIEW_SUBMIT_PAGE);
		});
	}

	componentWillUnmount() {
		if (this.didFocusSubscription) {
			this.didFocusSubscription();
		}
	}

	handleBackPress = () => {
		if (this.webview) {
			this.webview.goBack();
		}
	};

	render() {
		if (!this.props.user) {
			return <ActivityIndicator />;
		}

		return (
			<React.Fragment>
				{!this.state.loaded && <ActivityIndicator />}

				<CustomNavBar onBackPress={() => { this.handleBackPress() }} />
				<WebView
					ref={(ref) => (this.webview = ref)}
					onLoad={() => this.setState({ loaded: true })}
					source={{
						uri:
							'https://www.witheta.com/submit?user=' +
							MainUser.getToken() +
							'&theme=' +
							BaseStyler.getTheme() +
							'&city=' +
							this.props.ipCity,
					}}
					style={{ flex: 1, }}
					javaScriptEnabled={true}
				/>


			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => {
	const { user, theme, lastChatViewTime, config, ipCity } = state;
	return { user, theme, lastChatViewTime, config, ipCity };
};

export default connect(mapStateToProps)(SubmitScreen);
