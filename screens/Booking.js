import React, { Component } from 'react';
import { WebView } from 'react-native';


export default class BookingScreen extends Component { 

	constructor(props){ 
		super(props)
		this.state = { 
			url : null
		}
	}

	getUrl() {
		var url = this.props.route.params.url || null;

		if (url == null) { 
			return 'https://github.com/facebook/react-native'
		} 
		return url
	}

	render() { 
		return (
		<WebView
        	source={{uri: this.getUrl()}}
        	style={{marginTop: 20}}
      		/>
		)
	}

}