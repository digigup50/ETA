
import React from 'react'
import { Modal, SafeAreaView } from 'react-native'
import { getPersonPhoto } from '../managers/UtilsManager'
import { Image as CachedImage } from "react-native-expo-image-cache";

export default class UserProfileModalView extends React.Component { 

	getPhoto() { 
		if (this.props.user === null || this.props.user.profile_image === null) { 
			return	<Image source={require('../assets/images/person.png')} stlye={s.avatarStyle}/>

		} else { 
			return <CachedImage uri={getPersonPhoto(this.props.user.profile_image)} style={s.avatarStyle}/>
		}
	}

	render() { 
		return <Modal
				animationType="slide"
          		transparent={false}
         		visible={this.props.visible}
          		onRequestClose={() => this.props.onExit()}>
			<SafeAreaView>
				<View>
					{this.getPhoto()}
					<View>
						<Text>{this.props.user.username}</Text>
					</View>
				</View>
			</SafeAreaView>
		</Modal>
	}
}

const s = {
	avatarStyle : { height: 500, width: 500}
}