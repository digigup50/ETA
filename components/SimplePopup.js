import React from 'react'
import { View, Image, Dimensions } from 'react-native'
import { Text, Heading, Button } from 'native-base'
import Popup from './Popup'
import Constants from '../constants/GlobalStyles'
import AsyncStorage from '@react-native-async-storage/async-storage';
import StylerInstance from '../managers/BaseStyler'

export default class SimplePopup extends React.Component {

	onButtonPress() { 
		if (this.props.onButtonPress) { 
			this.props.onButtonPress();
		}
	}
	
	render() { 
		const windowSize = Dimensions.get('window')

		return (
			<Popup
				visible={this.props.visible}
				borderRadius={20}>
          	 
          	 <View style={{...Constants.centerView, ...{marginTop: 10, padding: 10}}}>
				<View>
					{/* <H2 style={{textAlign: 'center', marginTop: '5%', marginBottom: '5%', fontWeight: 'bold', color: StylerInstance.getOutlineColor()}}>{this.props.title}</H2> */}
					<Heading style={{textAlign: 'center', marginTop: '5%', marginBottom: '5%', fontWeight: 'bold', color: StylerInstance.getOutlineColor()}}>{this.props.title}</Heading>

					<Text style={{textAlign: 'center', color: StylerInstance.choose('gray', "white")}}>{this.props.data}</Text>
				</View>
			</View>

            <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 10}}>
             {this.props.noButton === undefined && <Button onPress={() => this.props.onButtonPress()}
             	style={{width: '80%'}}>
             <Text style={{textAlign: 'center', flex: 1}}>{this.props.buttonTitle ? this.props.buttonTitle : "Okay"}</Text>
             </Button>}
            </View>
			</Popup>) 

	}
}