import React from 'react'
import { View, Text, Image, Dimensions } from 'react-native'
import moment from 'moment'
import * as Animatable from 'react-native-animatable';

export default class EventTelemetryOverlay extends React.Component { 

	constructor(props) { 
		super(props)
		this.state =  { 
			telemetryActive: false, 
  			telemetryHide: false, 
  			telemetryIndex: 0, 
  			telemetryTimerId: null
		}
	}


	componentDidMount() {
		console.log("SETTING UP TELEMETRY VIEW")
		setTimeout(() => { this.showTelemetry() }, 1000)
		this.startTelemetryAsync()
	}

	startTelemetryAsync() { 
		let timerId = setInterval(() => this.showTelemetry(), 8000);
		this.setState({telemetryTimerId: timerId})
	}

	hideTelemetry() { 
		const newIndex = this.state.telemetryIndex + 1
		const eventMaxTelemetry = this.props.eventTelemetry.length - 1 
		this.setState({telemetryActive: false, telemetryHide: false})
		if (newIndex > eventMaxTelemetry) { 
			setTimeout(() => { clearInterval(this.state.telemetryTimerId) }, 0);
		} else { 
			this.setState({telemetryIndex: newIndex})
		}
	}

	popOutTelemetry() { 
		this.setState({telemetryActive:true, telemetryHide: true})
		setTimeout(() => { this.hideTelemetry() }, 1000);
	}

	showTelemetry() { 
		this.setState({telemetryActive: true, telemetryHide: false})
		setTimeout(() => { this.popOutTelemetry() }, 3000);
	} 


	getTelemetryDiv()  {
		const telemetry = this.props.eventTelemetry[this.state.telemetryIndex]
		const body =  <View style={{backgroundColor: 'white', margin: 10, display: 'flex', flexDirection: 'row', borderWidth:2, borderRadius: 10}}>
							<Image source={require('../assets/images/icon.png')} style={avatarStyle}/>
						  <View style={{margin:10}}>
							  <Text style={{marginBottom: 5, marginTop: 0}}>{telemetry.first_name}</Text> 
							  	<View style={{marginBottom: 5, marginTop: 0}}>
							  	 <Text style={{marginBottom: 5, marginTop: 0}}>got tickets to {this.props.eventName}</Text> 
							  	 <Text style={{marginBottom: 5, marginTop: 0, fontSize: 10}}>{moment(telemetry.created_at).startOf('minute').fromNow()}</Text>
						  </View>
					  </View>
					</View>
		const telemetryDivStyle = {position: 'absolute', width: '100%'}

		if (this.state.telemetryActive === true && this.state.telemetryHide === false) {
			return <Animatable.View animation="bounceInDown" style={telemetryDivStyle}>
				{body}
			</Animatable.View>
		} 

		if (this.state.telemetryActive === true && this.state.telemetryHide === true) { 
			return <Animatable.View animation="bounceOutUp" style={telemetryDivStyle}>
			{body}
			</Animatable.View>
		} else { 
			return null
		}

	}

	render() { 
		if (this.state.telemetryActive == false || this.props.eventTelemetry.length === 0) { 
			return null
		}

		return (
			<View>
					<View style={mobileStyle}>
						{this.getTelemetryDiv()}
					</View>
			</View>
			)
	}
}

const avatarStyle = {
		width : 40, height:40, borderRadius:40/2, backgroundColor: 'yellow', margin: 10
	}

const mobileStyle = { 
				position: 'fixed', /* Sit on top of the page content */
  				width: '100%', /* Full width (cover the whole page) */
  				bottom: Dimensions.get('window').height / 1.1,
  				left: 0,/* Black background with opacity */
  				zIndex: 1, /* Specify a stack order in case you're using a different order for other elements */
  				cursor: 'pointer' /* Add a pointer on hover */
			}