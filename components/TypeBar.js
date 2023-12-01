import React, { Component } from 'react';
import { TextInput, Button, View } from 'react-native';

export default class TypeBar extends Component { 

	static defaultProps = { 
		placeHolder: "Type something lit.."
	}

	constructor(props) { 
		super(props)
		this.state = { 
			input : "HEYYY", 
			didSubmit: false
		}
	}


	render() { 
		return (
				<View style = {{height: 40}}> 
					<TextInput
						value={this.state.input}
						onChangeText={(text) => this.setState({input: text})}
					/>
				</View>
			)
	}
}