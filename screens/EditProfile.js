import React, { Component } from 'react';
import { View, Text, TouchableHighlight, Alert, Image } from 'react-native';
import { Input, Button, FormControl } from 'native-base'
import MainUser from '../components/MainUser';
import { AnalyticsManager, events} from '../api/Analytics'
import ImageAPI from '../api/ImageAPI';
import ImagePicker from '../components/ImagePicker';
import { connect } from 'react-redux'
import { overwrite } from '../store'
import StylerInstance from '../managers/BaseStyler';
import ErrorManager from '../managers/ErrorManager';
import UserAPI from '../api/UserAPI';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

class EditProfileScreen extends Component { 

	constructor(props) { 
		super(props)
		this.state = {
			username: '', 
			email : '', 
			image: null
		}
		this.imageAPI = new ImageAPI();
		this.errorManager = new ErrorManager();
		this.userApi = new UserAPI();
	}

  onImagePicked(image) { 
  	this.setState({image: image})
  }

  getBackgroundImage() { 
  	if (this.props.user.profile_image == null) { 
  		return null
  	} 
  }

  getImage() { 
  	if (this.props.user == null) { 
  		return null
  	}

  	if (this.state.image != null) { 
  		return {uri: this.state.image}
  	}

  	if (this.props.user.profile_image == null) { 
  		return require('../assets/images/person.png')
  	} else { 
  		return {uri: this.props.user.profile_image.image}
  	}
  }

  handleSucess(data) {
  	this.props.dispatch(overwrite(data))
	Alert.alert("Sucess", 
  				"Your profile has been updated.", 
  				[
  				 {text: 'OK', onPress: () => this.props.navigation.goBack()}
  				])
  }

  async handleSubmit() { 
  	if (this.state.image != null){
  		AnalyticsManager.logEvent(events.USER_UPLOADED_IMAGE)
	  	const uploadResp = await this.imageAPI.uploadProfilePhoto(this.state.image);
		if (uploadResp && uploadResp.code !== -1) { 
			console.log(uploadResp);
			this.setState({image: null});
		}
  	}
	
  	var newEmail = null
  	if (this.state.email !== this.props.user.email && this.state.email !== "") { 
  		newEmail = this.state.email
  	}
  	var newUsername = null 
  	if (this.state.username !== this.props.user.username && this.state.username !== "") { 
  		AnalyticsManager.logEvent(events.USER_UPDATED_USERNAME)
  		newUsername = this.state.username
  	}

	const requestBody = {}
	if (newEmail) { 
		requestBody.email = newEmail;
	}
	if (newUsername) { 
		requestBody.username = newUsername;
	}

	const updateResp = await this.userApi.partialUpdate(this.props.user.id, requestBody); 
	if (updateResp && updateResp.code !== -1) { 
		this.handleSucess(updateResp)
	} else { 
		const errorMsg = this.errorManager.getErrorString(updateResp.error);
		Alert.alert(errorMsg);
	}
  }

	getEditView() { 
		return (
				<KeyboardAwareScrollView enableOnAndroid style={{backgroundColor: StylerInstance.getBackgroundColor()}}>
			{/* // <Content enableOnAndroid style={{backgroundColor: StylerInstance.getBackgroundColor()}}> */}
					<ImagePicker
						backgroundImage={null}
						onImageSelected={(val)=> this.onImagePicked(val)}
						width={120}
						height={120}
						style={{marginTop: 10}}
					/>
					<FormControl pl={2} pr={2}>
						<FormControl.Label style={{color: StylerInstance.getOutlineColor()}}>Username</FormControl.Label>
						<Input size="lg" variant="underlined" placeholder={this.props.user.username} 
	             		autoCapitalize="none"
						placeholderTextColor={StylerInstance.getOutlineColor()}
						style={{color: StylerInstance.getOutlineColor()}}
	             		onChangeText={(val)=> this.setState({username: val})}/>
						<FormControl.Label style={{color: StylerInstance.getOutlineColor()}}>Email</FormControl.Label>
						<Input size="lg" variant="underlined" placeholder={this.props.user.email}
	              		keyboardType="email-address"
	              		autoCapitalize="none"
						placeholderTextColor={StylerInstance.getOutlineColor()}
						style={{color: StylerInstance.getOutlineColor()}}
	              		onChangeText={(val)=> this.setState({email: val})}/>
					</FormControl>

{/* 
					 <Form>
	           			<Item stackedLabel>
	              			<Label style={{color: StylerInstance.getOutlineColor()}}>Username</Label>
	             		<Input placeholder={this.props.user.username} 
	             		autoCapitalize="none"
						placeholderTextColor={StylerInstance.getOutlineColor()}
						style={{color: StylerInstance.getOutlineColor()}}
	             		onChangeText={(val)=> this.setState({username: val})}/>
	            		</Item>
	            		<Item stackedLabel last>
	              			<Label style={{color: StylerInstance.getOutlineColor()}}>Email</Label>
	              		<Input placeholder={this.props.user.email}
	              		keyboardType="email-address"
	              		autoCapitalize="none"
						placeholderTextColor={StylerInstance.getOutlineColor()}
						style={{color: StylerInstance.getOutlineColor()}}
	              		onChangeText={(val)=> this.setState({email: val})}/>
	            		</Item>
	          		</Form> */}
	          		<View style={styles.buttonViewStyle}>
		          		<Button onPress={()=> this.handleSubmit()}
		          			style={styles.buttonStyle}>
		          			<Text style={{color:'white'}}>Submit</Text> 
		          		</Button>
	          		</View>
			{/* // </Content> */}
				</KeyboardAwareScrollView>
			)
	}

	render() {
		return this.getEditView()	
	}
}

const styles = {
	buttonViewStyle : { 
		flexDirection:'row', 
		justifyContent: 'center',
		marginTop: 15
	},

	buttonStyle : { 
		width:'70%', 
		justifyContent:'center'
	}
}

const mapStateToProps = (state) => { 
	const { user } = state
	return { user }
}

export default connect(mapStateToProps)(EditProfileScreen)