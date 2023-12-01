import React from 'react'
import { View, ScrollView } from 'react-native'
import { Text, H1, Spinner } from 'native-base'
import { WebView } from 'react-native-webview';
import { getTicketCountMap } from '../managers/UtilsManager'
import StylerInstance from '../managers/BaseStyler';
import BaseApiConfigProvider from '../managers/BaseApiConfigProvider';

export default class TicketScreen extends React.Component { 

	constructor(props) { 
		super(props)
		
		this.state = { 
			order: null,
			loading: false
		}

	}

	componentDidMount() { 
		const order = this.props.route.params.order || null;
		const orderId = this.props.route.params.orderId || null;
		if (order === null) { 
			Alert.alert("No order found!", 
					"Woah, looks like something went really wrong. Contact us if it persists")
			return
		}

		this.setState({order: order})
	}

	getOrderUrl() { 
		var apiUrl = BaseApiConfigProvider.getEnvUrl();
		let url =  apiUrl + "/order/" + this.state.order.id.toString()
		console.log(`url for qr code is ${url}`)
		return "https://www.witheta.com/create_qr?url=" + url.toString()
	}

	getTicketsView() { 
		let map = getTicketCountMap(this.state.order.tickets)
		const tickets = Object.keys(map)
		return tickets.map((item, index) => 
				<View>
				<Text style={{color: StylerInstance.getOutlineColor()}}>{map[item]} x {item}</Text>
				</View>
			)
	}

	getWebScannedView() { 
		const alreadyScanned = function(item) { 
			console.log(item)
			return item.scanned_at !== null && item.scanned_at !== undefined
		}

		console.log("Seeing if ticket/order has already been scanned")
		console.log(this.state.order.tickets.some(alreadyScanned))

		if (this.state.order.tickets.some(alreadyScanned)) { 
			return <Text style={{textAlign: 'center', marginTop: 20, color: StylerInstance.getOutlineColor()}}>
			Ticket has already been scanned. No longer valid.
			</Text>
		} else { 
			return null
		}
	}

	render() { 
		if (this.state.order !== null)  { 
			return (
				<ScrollView style={{flex: 1, backgroundColor: StylerInstance.getBackgroundColor()}}>
					<View style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 20}}>
						<H1 style={{fontWeight: 'bold', fontSize: 30, textAlign: 'center', color: StylerInstance.getOutlineColor()}}>{this.state.order.event.title}</H1>
						{
							this.getTicketsView()
						}
						<Text style={{color: StylerInstance.getOutlineColor()}}>{this.state.order.first_name} {this.state.order.last_name}</Text>
					</View>
					{ this.state.loading === true && <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: StylerInstance.getBackgroundColor()}}>
					<Spinner />
					</View>}

					{this.getWebScannedView()}
					<WebView source={{ uri: this.getOrderUrl() }} style={{ marginTop: 20, height:600, backgroundColor: StylerInstance.getBackgroundColor()}}
						onLoadStart={() =>this.setState({loading: true})}
						onLoadEnd={() => this.setState({loading: false})} 
						onLoad={() => this.setState({loading: false})}/>
				</ScrollView>
				)
		} else { 
			return <View><Text>I'm null??</Text></View>
		}
	}
}