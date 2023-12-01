import React from 'react'
import { View } from 'react-native'
import { Button } from 'native-base'

export default class Organize extends React.Component { 

	constructor(props) { 
		super(props)
	}

	render() {
		return (<View> 
					<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
						<Button><Text>Type</Text></Button>
						<Text>or</Text>
						<Button><Text>Scan</Text></Button>
					</View>
			</View>)
	}
}