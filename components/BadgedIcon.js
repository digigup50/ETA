import React from 'react'
import { View } from 'react-native'
import { Badge, Text } from 'native-base'


export default class BadgedIcon extends React.Component {
	render() { 
		return <View>
		{this.props.children}
		{this.props.count > 0 && <Badge colorScheme={"red"} style={{position: 'absolute', top: -4, right: -4, height: 13, width: 13, borderRadius: 13/2,
			justifyContent: 'center', alignItems: 'center'}}></Badge>}
		</View>
	}

}