import React, { Component } from 'react';
import { View, Text, TextInput, Alert, Modal, Platform } from 'react-native';
import { Heading, Icon, Input, Button, FormControl } from 'native-base';
import { AnalyticsManager, events} from '../api/Analytics';
import ImagePicker from '../components/ImagePicker'
import UserAPI from '../api/UserAPI';
import ImageAPI from '../api/ImageAPI';
import MainUser from '../components/MainUser';
import Loading from '../components/GameplanLoadingIndicator';
import { connect } from 'react-redux'
import { overwrite, setUserPath } from '../store'
import ErrorManager from '../managers/ErrorManager';
import StylerInstance from '../managers/BaseStyler';
import * as Sentry from 'sentry-expo';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';


class OnboardUserProfileScreen extends Component { 


	constructor(props) { 
		super(props)
		this.state = { 
			username: '',
			picture: null,
			imageApi: new ImageAPI(),
			userApi: new UserAPI(),
			pictureLoading: false,
			usernameLoading: false,
			modalVisible: false
		}
		this.userApi = new UserAPI(); 
		this.errorManager = new ErrorManager();
		this.imageApi = new ImageAPI();
	}

	componentDidMount(){ 
		if (this.props.user && this.props.user.profile_image != null && this.props.userPath === "onboard") { 
			console.log("NAVIGATING TO HOME FROM ONBOARD USER PROFILE SCREEN")
			this.props.dispatch(setUserPath(null));
		}
	}

	async updateUsername() { 
		if (this.state.username !== '') {
			const data = {username: this.state.username}
			this.setState({usernameLoading : true})

			const updateUserResp = await this.userApi.partialUpdate(this.props.user.id, data);
			if (updateUserResp && updateUserResp.code !== -1) {
				this.props.dispatch(overwrite(updateUserResp));
				this.setState({usernameLoading: false});
				// callback(data)
			} else { 
				console.log("Error while attempting to update user");
				const errorMsg = this.errorManager.getErrorString(updateUserResp.error);
				Sentry.Native.addBreadcrumb(updateUserResp);
				Sentry.Native.captureMessage(errorMsg);
				Alert.alert(errorMsg);
				this.setState({usernameLoading: false});
			}
		}
	}


	async continue() { 
		console.log("Onboard username is ")
		console.log(this.state.username)
		AnalyticsManager.logEvent(events.USER_ONBOARD_FINISH)

		if (this.state.picture !== null) {
			this.setState({pictureLoading: true})
			const uploadResp = await this.imageApi.uploadProfilePhoto(this.state.picture);
			if (uploadResp && uploadResp.code !== -1) { 
				this.setState({pictureLoading: false});
			} else { 
				const errorMsg = this.errorManager.getErrorString(uploadResp);
				Sentry.Native.captureMessage(errorMsg);
				Alert.alert(errorMsg);
			}
		} else {
			console.log("=====PART 4====")
			console.log(this.props.navigation);
		}
		await this.updateUsername();
		this.finishOnboarding()
	}

	finishOnboarding() { 
		if (Platform.OS == 'android') { 
			this.props.dispatch(setUserPath(null));
		} else {
			this.setState({modalVisible: true});
			return 
		}
	}

	onProfileImageSelected(imageUrl){ 
		this.setState({picture: imageUrl})
	}

	onDismiss() { 
		AnalyticsManager.logEvent(events.USER_ONBOARD_FINISH);
		this.props.dispatch(setUserPath(null));
	}

	skip() { 
		AnalyticsManager.logEvent(events.USER_ONBOARD_FINISH)
		this.finishOnboarding()
	}

	getNotificationModal() { 
		return (
			<Modal
	          animationType="fade"
	          transparent={true}
	          visible={this.state.modalVisible}
	          onDismiss={()=> 
	          	this.onDismiss()
	          }
	          onRequestClose={() => {
	            this.onDismiss()
	          }}>
	          <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
	            <View style={{ backgroundColor: StylerInstance.getBackgroundColor(), width:'80%',
	      		justifyContent: 'center', alignItems:'center'}}>
	      			<Heading style={{marginTop: 20, fontWeight: 'bold', color: StylerInstance.getOutlineColor()}}>Notifications</Heading>

	      			<Icon as={Ionicons} size="lg" style={{marginTop: 20, marginBottom: 10}} name="ios-notifications"/>

	              	<Text style={{margin:15, fontSize: 14, textAlign: 'center', color: StylerInstance.getOutlineColor()}}>ETA uses notifications to let you know about rare upcoming events and 
	              	when people respond to your comments</Text>

	              	<View style={styles.specialButtonView}>
		              	<Button style={styles.specialButtonStyle}
		              	onPress={()=> this.onDismiss()}>
		              		Got it
		              	</Button>
	              	</View>
	            </View>
	          </View>
	        </Modal>
	      )
	}

	getUserProfileImage() { 
		console.log(this.props.user)
		const profile_image = this.props.user && this.props.user.profile_image 
		if (profile_image == null) { 
			return null
		} else { 
			return profile_image.image
		}
	}


	render() { 
		const modal = this.getNotificationModal()
		if (this.state.pictureLoading == true || this.state.usernameLoading == true) { 
			return (<Loading/>)
		}
		return ( 
			<View style={{flex: 1, alignItems: 'center', backgroundColor: StylerInstance.getBackgroundColor()}}>
				<KeyboardAwareScrollView>
				{modal}
					<View style={{marginTop: 20 }}> 
						<ImagePicker
						backgroundImage={this.getUserProfileImage()}
						onImageSelected={(val)=>this.onProfileImageSelected(val)}
						style={{marginBottom: 30}}/>

						<Text style={{marginLeft:10, marginRight:10, color: StylerInstance.getOutlineColor()}}>Enter a unique user name or 
						continue with the generated one.</Text>

						<FormControl mr={3} ml={3} mt={4}>
							<FormControl.Label style={{color: StylerInstance.getOutlineColor()}}>Username</FormControl.Label>
							<Input 
							 	variant="underlined"
								autoCapitalize="none"
								returnKeyType="done"
								style={{color: StylerInstance.getOutlineColor()}}
								placeholder={this.props.user && this.props.user.username}
								onChangeText={(val) => this.setState({username:val})}/>
						</FormControl>

						<View style={styles.buttonViewStyle}>
			          		<Button onPress={()=> this.continue()}
			          			style={styles.buttonStyle}>
			          			<Text style={{color:'white'}}>Continue</Text> 
			          		</Button>
	          			</View>


						<View style={styles.buttonViewStyle}>
			          		<Button onPress={()=> this.skip()}
			          			style={styles.buttonStyle}>
			          			<Text style={{color:'white'}}>Skip</Text> 
			          		</Button>
	          			</View>
			        </View>
			     </KeyboardAwareScrollView>
			</View>
		)
	}
}

const mapStateToProps = (state) =>   {
	const { user, userPath } = state
	return { user, userPath };
}

export default connect(mapStateToProps)(OnboardUserProfileScreen)


const styles = {
	specialButtonView: { 
		flexDirection:'row', 
		justifyContent: 'center',
		marginTop: 15,
		marginBottom: 20
	},

	buttonViewStyle : { 
		flexDirection:'row', 
		justifyContent: 'center',
		marginTop: 15
	},

	buttonStyle : { 
		width:'60%', 
		justifyContent:'center'
	},

	specialButtonStyle: { 
		width:'30%', 
		justifyContent:'center'
	}
}