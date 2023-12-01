import React, { Component } from 'react';
import { TouchableHighlight, Button, View, Image, ImageBackground } from 'react-native';
import { Image as NBImage } from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';


export default class MyImagePicker extends Component { 

	static defaultProps = {
		height: 100, 
		width: 100
	}

	constructor(props) { 
		super(props)
		this.state = { 
			image: null
		}
	}

	_pickImage = async () => {
		console.log("image clicked. Asking for permission")
		Permissions.askAsync(Permissions.CAMERA_ROLL)
		console.log("clicked image")
	    let result = await ImagePicker.launchImageLibraryAsync({
	      allowsEditing: true,
	      aspect: [4, 3],
	    });

	    if (!result.cancelled) {
	    	this.setState({image: result.uri})
	      	this.props.onImageSelected(result.uri)
	    }
	  };

	getStyle() { 
		if (this.props.style == null) { 
		}
	}

	getImage() { 
		if (this.state.image == null) { 
			return this.props.backgroundImage
		} else { 
			return this.state.image
		}
	}

	getImageThumbnail() { 
		if (this.props.backgroundImage != null || this.state.image != null) {
		return (
			<View style={this.props.style}>
			< NBImage size="large" source={{uri: this.getImage()}}
					style={{
						width : this.props.width, 
						height:this.props.height, 
						borderRadius: this.props.height/2, 
						borderWidth:5, borderColor:'white'}}/>
			</View>)
		} else { 
			return (
						<View style={this.props.style}>
							<ImageBackground style={{width:this.props.width, height:this.props.height, backgroundColor:'gray', borderRadius: this.props.height/2, borderWidth:5,
							borderColor: 'white'}}>
							<View style={{flex: 1, justifyContent:'center', alignItems: 'center'}}>
								<Image source={require('../assets/images/camera.png')}
								style={{height:30, width:30}}/>
							</View>
							</ImageBackground>
						</View>
						)
		}
	}

	render() { 
		return (
			<TouchableHighlight style={{flexDirection:'row', justifyContent:'center'}}
				onPress={()=> this._pickImage()}>
				{this.getImageThumbnail()}
				</TouchableHighlight>
			);
	}
}