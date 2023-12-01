import React from 'react'
import { View, Text, Image, TouchableWithoutFeedback } from 'react-native'
import { getPhoto } from '../managers/UserPhotoManager'
import GlobalStyles from '../constants/GlobalStyles'
import { Image as CachedImage } from "react-native-expo-image-cache";
import Colors from '../constants/Colors'
import BufferedTextField from './BufferedTextField'

export default class UserViewCell extends React.Component { 

	static defaultProps =  { 
		user: null, 
		username: 'no_user_name',
		image_url: null,
		title: null, 
		bio: null
	}

	getImage(){

	  	var image = null
	  	if (this.props.user !== null) { 
	  		image = getPhoto(this.props.user.profile_image)
	  	} else { 
	  		image = this.props.image_url
	  	}

	  	if (image == null) { 
	  		return (<Image source={require('../assets/images/person.png')} style={GlobalStyles.avatarStyle}/>)
	  	} else { 
	  		return (<CachedImage uri={image} style={{...GlobalStyles.avatarStyle, ...this.props.imageStyle}}/>)
	  	}
  }

	render() { 
		return <View style={{...this.props.style}}>
				<TouchableWithoutFeedback
				onPress={(e) => this.props.onClick(this.props.username)}
				style={{flexDirection:'row', justifyContent:'center'}}>
					<View>
						<View style={GlobalStyles.centerView}>
							{this.getImage()}
						</View>
						<View>
							<Text style={{textAlign: 'center', color: Colors.primaryETAButtonColor, marginTop: '10%'}}>{this.props.username}</Text>

						    {this.props.title !== null && <Text 
						    	style={{textAlign: 'center', fontWeight: 'bold', color: 'gray', marginTop: '5%'}}
						    	>{this.props.title}</Text>}

							{this.props.bio !== null && <View style={{marginTop: '5%'}}>
														<BufferedTextField
														textStyle={{color: 'gray', textAlign: 'center'}}
														text={this.props.bio}/>
														</View>}
						</View>
					</View>
				</TouchableWithoutFeedback>
			</View>
	}
}