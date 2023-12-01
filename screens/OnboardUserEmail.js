import React, { Component } from 'react';
import { View, Text, TextInput, Alert, Modal, Platform } from 'react-native';
import { Input, Button, Heading, FormControl } from 'native-base';
import { AnalyticsManager, events} from '../api/Analytics';
import ImagePicker from '../components/ImagePicker'
import UserAPI from '../api/UserAPI';
import ImageAPI from '../api/ImageAPI';
import MainUser from '../components/MainUser';
import Loading from '../components/GameplanLoadingIndicator';
import { connect } from 'react-redux'
import { overwrite, setUserPath } from '../store'
import LazyCityPickerVC from '../controllers/LazyCityPickerVC'
import ErrorManager from '../managers/ErrorManager'
import StylerInstance from '../managers/BaseStyler';

class OnboardUserEmailScreen extends Component { 

	

	constructor(props) { 
		super(props)
		this.state = { 
			email: '',
			loading: false,
			cityPickerVisible: false
		}

		this.userApi = new UserAPI()
		this.errorManager = new ErrorManager()
	}

	async componentDidMount() { 
		this.setState({loading: true})
		console.log("lOADING USER FROM API FOR ONBOARD USER EMAIL");
		const userData = await MainUser.loadUserFromApiAsync();
		if (userData && userData.code !== -1) { 
 			this.props.dispatch(overwrite(userData))
			this.props.dispatch(setUserPath("onboard")); 
			AnalyticsManager.setUserId(userData.id);
			console.log('data ==>',userData)
			this.setState({loading: false})
			if (userData.email != null) { 
				this.props.navigation.navigate('OnboardingStack', {screen: "OnboardUser"})
			} else { 
				this.setState({loading: false})
				AnalyticsManager.logEvent(events.USER_ONBOARD_START)
			}
		} else { 
			Alert.alert("Sorry, we failed to load your account", 
			"", 
			[
				{text: 'OK', onPress: () => this.props.navigation.navigate("OnboardingStack", {screen: "Login"})}
			]);
		}
	}

	async continue() { 
		weak = this
		const data = await this.userApi.partialUpdate(this.props.user.id, {zone_slug: 'default', email: this.state.email})
		if (data && data.code !== -1) { 	
			weak.props.dispatch(overwrite(data))
			weak.props.navigation.navigate('OnboardingStack', {screen: "OnboardUser"})
			return
		} else { 
			console.log(data.error)
			weak.setState({loading: false})
		}
	}

	async handleZoneSelect(zone) { 
		if (this.state.email == '') { 
			Alert.alert("Try Again", "Please enter a valid email address")
			return
		}

		const userResp = await this.userApi.partialUpdate(this.props.user.id, {zone_slug: zone.slug, email: this.state.email});
		if (userResp && userResp.code !== -1) { 
			this.props.dispatch(overwrite(userResp));
			this.props.navigation.navigate("OnboardUser");
			this.setState({cityPickerVisible: false});
		} else { 
			console.log(userResp);
			this.setState({loading: false});
			const errorString = this.errorManager.getErrorString(error)
			console.log(`error string is ${errorString}`)
			Alert.alert(errorString, null, [{text: "Okay", onPress: () => weak.setState({cityPickerVisible: false})}]);
		}
	}

	render() { 
		if (this.state.loading == true) { 
			return (
				<Loading/>
				)
		}
		return ( 
			<View style={{flex: 1, backgroundColor: StylerInstance.getBackgroundColor()}}>
			<View>
				<View style={{marginLeft: 10, marginTop: 80}}>
					<Heading style={{marginBottom: 15, marginTop: 0, fontWeight: 'bold', color: StylerInstance.getOutlineColor()}}>Please enter your email</Heading>
					<Text style={{marginBottom:10, color: StylerInstance.getOutlineColor()}}>We will use this to contact you about your account.</Text>
	          	</View>


				<FormControl mr={3} ml={3}>
					{/* <FormControl.HelperText>Email</FormControl.HelperText> */}
					<Input 
						variant="underlined"
						style={{color: StylerInstance.getOutlineColor()}}
						keyboardType="email-address"
						placeholder='Your email...'
						size="lg"
						returnKeyType="done"
						autoCapitalize="none"
						onChangeText={(val)=> this.setState({email:val})}
					/>
				</FormControl>

	          	{/* <Form> 
					<Item floatingLabel>
						<Label style={{color: StylerInstance.getOutlineColor()}}>Email</Label>
						<Input
							keyboardType="email-address"
							returnKeyType="done"
							autoCapitalize="none"
							style={{color: StylerInstance.getOutlineColor()}}
							onChangeText={(val)=> this.setState({email:val})}
						/>
					</Item>
				</Form> */}

				<View style={styles.buttonViewStyle}>
		          		<Button onPress={()=> this.continue()}
		          			style={styles.buttonStyle}>
		          			<Text style={{color:'white'}}>Continue</Text> 
		          		</Button>
	          	</View>

			   </View>
			   {/* <LazyCityPickerVC
			   	visible={this.state.cityPickerVisible}
			   	onExit={this.setState({cityPickerVisible: false})}
			   	onSelect={this.handleZoneSelect}
			   /> */}
			</View>
		)
	}
}

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

const mapStateToProps = (state) =>   {
	const { user } = state
	return { user }
}

export default connect(mapStateToProps)(OnboardUserEmailScreen)