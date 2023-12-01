import React, { Component } from 'react';
import { View, Image } from 'react-native';

export default class ImageLoader extends Component { 

	constructor(props){ 
		super(props)
	}

	getImage() {
		if(this.props.url != null) {
			return (<Image src={this.props.url}/>)
		} else { 
			if (this.props.isEvent) { 
				return <Image src={require('../assets/images/3.jpg')}/>
			} else { 
				return (<View style={{backgroundColor:'black'}}></View>)
			}
		}
	}

	render() { 
		return ( 
			<View style={this.props.style}> 
				{this.getImage()}
			</View>
			)
	}
}