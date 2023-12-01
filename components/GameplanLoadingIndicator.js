import React, { Component } from 'react';
import { View, ActivityIndicator } from 'react-native';
import StylerInstance from '../managers/BaseStyler';


export default class GameplanLoadingIndicator extends Component { 
	
	render() { 
		return (
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: StylerInstance.getBackgroundColor()}}>
					<ActivityIndicator size="large" color={StylerInstance.choose('#0000ff', 'white')} />
				</View>
			)
	}

}