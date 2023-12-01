import React from 'react'
import { SafeAreaView, View, Modal, Button } from 'react-native'
import StylerInstance from '../managers/BaseStyler'

export default class Popup extends React.Component { 

	static defaultProps = { 
		borderRadius: 10,
		includeExit: false,
		height: '70%', 
		width: '90%'
	}

	maybeGetCenteredProps() { 
		if (this.props.centeredContent) {
			return { display: 'flex', justifyContent: 'center', alignItems: 'center'}
		} else { 
			return null;
		}
	}

	getContent() { 
		return <View style={{height: this.props.height, width: this.props.width, borderRadius: this.props.borderRadius, backgroundColor: StylerInstance.getBackgroundColor(), borderColor: 'black', ...this.maybeGetCenteredProps()}}>
		{this.props.includeExit && <Button onPress={() => this.props.onExit()}
		title="x"/>}
		{this.props.children}
		</View>
	}

	render() { 
		return (<Modal
				 animationType="slide"
				 transparent
          		 visible={this.props.visible}
          		 onRequestClose={() => this.props.onExit !== undefined && this.props.onExit()}>
          		<SafeAreaView style={{flex: 1, justifyContent: 'center',  alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          		{this.getContent()}
          		</SafeAreaView>
				</Modal>) 

	}
}