import React from 'react'
import Popup from './Popup'
import { View, Image, Dimensions, Alert } from 'react-native'
import { Text, Button } from 'native-base'
import Constants from '../constants/GlobalStyles'
import { AnalyticsManager, events } from '../api/Analytics'
import StylerInstance from '../managers/BaseStyler';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const defaultUserImage = "https://gameplan-image-urls.s3.us-east-2.amazonaws.com/person.png";

export default class UserProfilePopup extends React.Component {

	static defaultProps = {
		user: null,
		visible: false
	}

	constructor(props) {
		super(props)
	}

	canShow() {
		return this.props.user !== null
	}

	onDone() {
		AnalyticsManager.logEvent(events.USER_VIEWED_CELL_PROFILE)
		if (this.props.onDoneClicked) {
			this.props.onDoneClicked()
		}
	}

	onChat() {
		AnalyticsManager.logEvent(events.USER_START_CHAT_PROFILE);
		if (this.props.onDirectMessage) {
			this.props.onDirectMessage(this.props.user);
		}
	}

	getImage() {
		return { uri: this.props.user.image }
	}

	render() {
		this.props.user && console.log('@!@!@!@!@!@!@', this.props.user)
		return (
			<Popup
				visible={this.canShow()}
				borderRadius={20}>

				<View style={{ flex: 1, backgroundColor: StylerInstance.getBackgroundColor() }}>
					<View style={{ flex: 1 }}>
						<View style={{ flex: 3 }}>
							{this.props.user && <Image source={this.props.user.image ? this.props.user.image : { uri: defaultUserImage }} style={{ flex: 5 }} />}
							<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
								{this.props.user && <Text style={{ flex: 1, textAlign: 'center', color: StylerInstance.getOutlineColor() }}>{this.props.user.username}</Text>}
							</View>
						</View>
						<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
							{this.props.user && this.props.user.allow_dm && <Button dark style={{ width: '50%', alignSelf: 'center', marginBottom: 10 }} onPress={() => this.onChat()}>
								Message
							</Button>}

							<Button style={{ width: '50%', alignSelf: 'center' }} onPress={() => this.onDone()}>
								Done
							</Button>
						</View>
					</View>
					<MaterialIcons
						name="close"
						size={30}
						color={"#fff"}
						style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}
						onPress={() => this.onDone()} // Close the popup when the close icon is clicked
					/>
				</View>
			</Popup>
		)
	}
}
