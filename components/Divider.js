import React, {Component} from 'react'
import { View } from 'react-native';

export default class Divider extends Component { 

	static defaultProps = { 
		visible: true
	}

	getStyle() { 
		if (this.props.visible) { 
			return {marginTop: '8%', marginBottom: '8%'}
		} else {
			return {marginTop: '4%', marginBottom: '4%'}
		}
	}

	render() { 
		return (
			<View style={this.getStyle()}> 

			{this.props.visible === true && <View style={{backgroundColor:'lightgray', height:1, width:'98%'}}></View>}
			</View>
			)
	}

}