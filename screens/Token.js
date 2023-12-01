import { Text, TextInput, Alert } from 'react-native';
import React, { Component } from 'react';
import UserAPI from '../api/UserAPI';
import { Input, Button, Spinner, FormControl, Heading, View } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainUser from '../components/MainUser'
import StylerInstance from '../managers/BaseStyler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
export default class TokenScreen extends Component { 

	static navigationOptions = {  headerTransparent: true };

	constructor(props) { 
		super(props)
		this.state = {
			code: '',
			sent: false, 
			userAPI: new UserAPI(),
			loading: false
		}
	}

	async validateCode() { 
		this.setState({sent: true, loading: true})
		const weakThis = this
		const validateResp = await this.state.userAPI.validateAuth(this.state.code)
		if (validateResp && validateResp.code !== -1) { 
			console.log("VALIDATED CODE DATA");
			console.log(validateResp);
			if (validateResp != null) { 
				weakThis.setState({loading: false})
				MainUser.setToken(validateResp.token)
				AsyncStorage.setItem('token', validateResp.token).then((val) => this.props.navigation.navigate("OnboardEmail"))
			} else { 
				weakThis.setState({loading: false})
			}
		} else { 
			Alert.alert("Oops", "Code entered is not correct")
			weakThis.setState({loading: false})
		}
	}

	render() { 
		if (this.state.loading == true){ 
			return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              	<Spinner />
            	</View>)
		} 
		return (
			<KeyboardAwareScrollView style={{ flex: 1, backgroundColor: StylerInstance.getBackgroundColor()}}>
				<View style={{marginTop:80, marginLeft: 15}}>
					{/* <H1 style={{fontWeight: 'bold', marginBottom: 10, color: StylerInstance.getOutlineColor()}}>Enter code</H1> */}
					<Heading mb={2}>Enter code</Heading>
					<Text mb={3} style={{color: StylerInstance.getOutlineColor()}}>Please enter the code sent to the number previously entered. 
					It may take up to 60 seconds to recieve the text</Text>
				</View>

				<FormControl mr={3} ml={3} mt={2}>
					{/* <FormControl.Label>Code</FormControl.Label> */}
					<Input
						variant="underlined"
						style={{color: StylerInstance.getOutlineColor()}}
						keyboardType="phone-pad"
						returnKeyType="done"
						placeholder='Enter the code..'
						size="lg"
						onChangeText={(val)=> this.setState({code:val})}/>
				</FormControl>
				<View>
					<View style={styles.buttonViewStyle}>
							<Button onPress={()=> this.validateCode()}
								style={styles.buttonStyle}>
								<Text style={{color:'white'}}>Submit</Text> 
							</Button>
					</View>

					<View style={styles.buttonViewStyle}>
							<Button colorScheme={"blueGray"} onPress={() => this.props.navigation.navigate("Login")} style={styles.buttonStyle}>
								<Text style={{color: 'white'}}>Back</Text>
							</Button>
					</View>
				  </View>

	        </KeyboardAwareScrollView>
			);	
	}
}

const styles = {
	buttonViewStyle : { 
		flexDirection:'row', 
		justifyContent: 'center',
		marginTop: 15
	},

	buttonStyle : { 
		width:'60%', 
		justifyContent:'center'
	}
}
