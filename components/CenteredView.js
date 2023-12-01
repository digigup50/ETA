import React from 'react'
import { View } from 'react-native'

export default class CenteredView extends React.Component { 

	constructor(props) { 
		super(props)
	}

	render() { 
		return <View 
		style={{...{display: 'flex', justifyContent: 'center', alignItems: 'center'}, ...this.props.style}}
		>{this.props.children}</View>
	}
}