import React from 'react'
import { View, Alert, Linking } from 'react-native'
import { AnalyticsManager, events } from '../api/Analytics'
import { Entypo } from '@expo/vector-icons'
import { Text } from 'native-base'
import * as StoreReview from 'expo-store-review';
import Popup from '../components/Popup'
import StylerInstance from '../managers/BaseStyler'

export default class RatingView extends React.Component { 

	static defaultProps =  {
		text: 'Are we killing it or nah?',
		onRate: null
	}

	constructor(props) { 
		super(props)
		this.state =  {
			rating: -1,
			clicked: false
		}
	}

	onDidClick(rating) {
		this.setState({rating: rating})
		if (rating !== -1) { 
			AnalyticsManager.logEvent(events.USER_RATED_CURATION, {rating: rating.toString()})
		}

		if (rating <= 3) { 
			Alert.alert(
			'😔',
			 'Please give us feedback so we can improve.',
			  [
			    {
			      text: 'Cancel',
			      onPress: () => console.log('Cancel Pressed'),
			      style: 'cancel',
			    },
			    { text: 'OK', onPress: () => Linking.openURL("mailto:info@witheta.com?subject=Feedback") },
			  ],
			  { cancelable: false })
		}

		if (rating > 3) { 
			Alert.alert(
			'🙌🏾',
			 'Help us out with a quick review',
			  [
			    { text: 'OK', onPress: () => StoreReview.requestReview() }
			  ],
			  { cancelable: false })
		}

		if (this.props.onRate !== null) { 
			this.props.onRate(rating)
		}
		this.setState({clicked: true})
	}

	getColor(index) { 
		const style = { 
			fontSize: 30	
		}

		if (this.state.rating < index || this.state.rating === -1) { 
			style.color = "gray"
		} else { 
			style.color = "gold"
		}

		return style
	}

	getContent() { 
		if (this.state.clicked){
			return 	<Text style={{marginBottom: '5%', color: StylerInstance.getOutlineColor()}}>Thank you for the feedback!</Text>
		} else { 
			return <React.Fragment>
			<Text style={{marginBottom: '5%', color: StylerInstance.getOutlineColor()}}>{this.props.text}</Text>
			<View style={style.container}>
				<View style={{justifyContent: 'space-around', flexDirection: 'row'}}>
					<Entypo name="star" 
					style={this.getColor(0)} 
					onPress={() => this.onDidClick(0)}/>
					<Entypo name="star"
					onPress={() => this.onDidClick(1)} 
					style={this.getColor(1)}/>
					<Entypo name="star" 
					onPress={() => this.onDidClick(2)}
					style={this.getColor(2)}/>
					<Entypo name="star" 
					onPress={() => this.onDidClick(3)}
					style={this.getColor(3)}/>
					<Entypo name="star" 
					onPress={() => this.onDidClick(4)}
					style={this.getColor(4)}/>
				</View>
			</View>
			</React.Fragment>
		}
	}

	render() { 
		return <View style={{justifyContent: 'center', alignItems: 'center', margin: 20}}>
			{this.getContent()}
		</View>

	}
}

const style = {

	container: { 
		width: '60%'
	}

}