import React, { Component } from 'react';
import { View, Text, StyleSheet} from 'react-native';


export default class GameplanHeaderText extends Component { 

	constructor(props){ 
		super(props)
	}

	render() { 
		return (
			<Text style = {headerStyle.header}> 
			{this.props.children}
			</Text>
		);
	}
}

const headerStyle = StyleSheet.create(
{
	header: {
    fontSize: 20,
    fontWeight: 'bold',
	}

});