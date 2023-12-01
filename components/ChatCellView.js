import React from 'react'
// import { View } from 'react-native'
import { Icon, Badge, Text, Pressable, Image, View } from 'native-base'
import { getETAPhoto } from '../managers/UserPhotoManager'
import StylerInstance from '../managers/BaseStyler'
import { connect } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'

export default class ChatCellView extends React.Component { 
	
	getRight() { 
			return (
					<View flex={1} style={{flexDirection: 'row', justifyContent: "center"}}>
						<View flex alignItems={"center"} justifyContent={"center"} h="100%"> 
							{this.props.badgeCount > 0 && <Badge colorScheme={"info"} variant="solid" h="30" w="30" rounded="full" style={{marginRight:5}}>{this.props.badgeCount}</Badge>}
							{this.props.muted && <Icon as={Ionicons} name="md-notifications-off"/>}
						</View>
					</View>
				)
	}

	getTextStyle() { 
		if (this.props.badgeCount > 0) { 
			return {fontWeight: 'bold', color: StylerInstance.getOutlineColor()}
		} else { 
			return {color: StylerInstance.getOutlineColor()}
		}
	}


	render() { 
			return <Pressable pl="2" pr="2" mt={2} mb={2} flex flexDirection={"row"} onPress={()=> this.props.onPress()}>
					<View flex="1">
						<Image size="sm" source={getETAPhoto(this.props.image)} />
					</View>
					<View flex="3" justifyContent={"center"}>
								<Text style={{fontWeight:'bold', color: StylerInstance.getOutlineColor()}}>{this.props.title}</Text>
								{this.props.username !== null 
									&& <Text 
										numberOfLines={1}
										style={this.getTextStyle()}>{this.props.username}: {this.props.value}</Text>}
					</View>
					{/* <View> */}
						{this.getRight()}
					{/* </View> */}
				</Pressable>
	}
}