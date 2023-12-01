import React from 'react'
import { View, Text, Dimensions, TouchableOpacity, Keyboard, Linking, StyleSheet, Platform, Alert} from 'react-native'
import { Button, Content, Spinner } from 'native-base'
import Autocomplete from 'react-native-autocomplete-input';
import TicketResultModal from '../components/TicketResultModal'
import EventAPI from '../api/EventAPI'
import StylerInstance from '../managers/BaseStyler'

export default class OrganizeScreen extends React.Component { 


	constructor(props) { 
		super(props)
		this.state =  {
			loading: false,
			eventApi: new EventAPI(),
			event: null, 
			query: '',
			tickets: [],
			showOther: true, 
			modalVisible: false,
			userTickets: [], 
			focusSub: null
		}
	}

	getRefreshButton() { 
		return (<Button transparent onPress={() => this.fetchData(this.state.event.id)}>
				<Text style={{paddingRight: 10, color: StylerInstance.getOutlineColor(), paddingLeft: 10, fontSize: 16}}>Refresh</Text></Button>)
	}

	setUpTickets(event) { 
		tickets = event.ticket_groups.map( x => x.tickets.map(y => y.first_name + " " + y.last_name))
		allTickets = []
		tickets.map (x => x.map (y => allTickets.push(y.toLowerCase())))
		console.log("ALLL TICKETS")
		console.log(allTickets)
		const uniqueTickets = new Set(allTickets)
		this.setState({event: event, tickets: uniqueTickets})
	}

	componentDidMount(){ 
		this.props.navigation.setOptions({ headerRight: () => this.getRefreshButton()});
		console.log("COMPONENT MOUNTED");
		const event = this.props.route.params.event || null;
		console.log("event is")
		console.log(event)
		if (!event) { 
			Alert.alert("No event selected");
			return;
		}
		this.setState({event: event})
	    this.fetchData(event.id)
		subThis = this

		const didBlurSubscription = this.props.navigation.addListener(
  			'focus',
  			payload => {
  				console.log("FOCUSING")
    			this.fetchData(event.id);
  			}
		)

		this.setState({focusSub: didBlurSubscription})

		this.keyboardDidShowListener = Keyboard.addListener(
	      'keyboardDidShow',
	      () => subThis.setState({showOther: false}) ,
    	);

    	this.keyboardDidHideListener = Keyboard.addListener(
	      'keyboardDidHide',
	      () => subThis.setState({showOther: true, query: ''}),
	    );

	}

	componentWillUnmount() {
	    this.keyboardDidShowListener.remove();
	    this.keyboardDidHideListener.remove();
	    const sub = this.state.focusSub
	    sub();
	}

	handleSuccess(data) { 
		console.log(`Recieved data ${data}`)
		this.setUpTickets(data)
		this.setState({event: data, loading: false})
	}

	async fetchData(eventId) { 
		console.log("FETCHING DATA")
		if (eventId === undefined) { 
			Alert.alert("No event selected");
			this.setState({loading: false})
			return
		}
		x = this
		console.log(this.state)
		this.setState({loading: true})
		const event = await this.state.eventApi.getOrganizerEvent(eventId);
		console.log(event)
		if (event && event.code !== -1) { 
			this.handleSuccess(event);
		} else { 
			this.setState({loading: false});
			Alert.alert("Failed to fetch event data. Plese try again later");
		}
	}

	handlePress(item) { 
		const names = item.split(" ")
		console.log(names)
		var userTickets = []
		for (var group of this.state.event.ticket_groups) { 
			const tickets = group.tickets.filter(x => x.first_name.toLowerCase() === names[0] && x.last_name.toLowerCase() === names[1])
			console.log("FOUNDDD TICKETS")
			console.log(tickets)
			userTickets.push({title: group.title, count: tickets.length})
		}
		console.log("handling press")
		this.setState({modalVisible: true, userTickets: userTickets})
	}

	getStyle() { 
		if (Platform.OS == 'android'){ 
			return styles.autocompleteContainer
		}
	}

	getAutocomplete(data) { 
		if (this.state.loading) { 
			return (
				<View style={{flex: 1, justifyContent: 'center'}}>
					<Spinner />
				</View>
			)
		} else { 
			return (<View>
					<Text style={{margin: 10, color: StylerInstance.getOutlineColor()}}>Start typing name</Text>
							<View style={this.getStyle()}>
									<Autocomplete
								      data={data}
								      defaultValue={this.state.query}
								      onChangeText={text => this.setState({ query: text })}
								      onShowResult={() => console.log("showing result")}
								      renderItem={({ item, i }) => (
								        <TouchableOpacity 
								        style={{backgroundColor: StylerInstance.getBackgroundColor(), height: 40, justifyContent: 'center', borderWidth: 1, width:'100%'}}
								        onPress={() => this.handlePress(item)}>
								          <Text style={{color: StylerInstance.getOutlineColor()}}>{item}</Text>
								        </TouchableOpacity>
								      )}
								    />
							</View>
				</View>)
		}

	}

	render() {
		if (this.state.event == null && this.state.loading === false) { 
			return <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
				<Text>Sorry, could not load event page</Text>
			</View>

		}
		const query = this.state.query.toLowerCase()
		var data = []
		if (query !== '') { 
			const tixs = [...this.state.tickets]
			data = tixs.filter( x => x.substring(0, query.length) === query)
			console.log(data)
		}

		return (
			<View style={{backgroundColor: StylerInstance.choose('#f6f7f8', "black"), flex: 1}}> 
							{this.getAutocomplete(data)}
							{this.state.showOther && <View style={{flex:1, alignSelf: 'center', justifyContent: 'center'}}> 
								<View style={{backgroundColor: StylerInstance.getBackgroundColor(), padding: 20}}>
								<Text style={{color: StylerInstance.getOutlineColor()}}>or</Text>
								<View>
									<Button style={{width: Dimensions.get('window').width / 2, marginTop: 20, alignItems: 'center', justifyContent: 'center'}}
									onPress={() => this.props.navigation.navigate("Scanner", {event: this.state.event})}>
										<Text style={{color: 'white'}}>Scan</Text>
									</Button>
								</View>
								<View>
									<Button style={{width: Dimensions.get('window').width / 2, marginTop: 20, alignItems: 'center', justifyContent: 'center'}}
									onPress={() => Linking.openURL("https://www.witheta.com/organize/" + this.state.event.id)}>
										<Text style={{color: 'white'}}>Open Event Dashboard</Text>
									</Button>
								</View>
								</View>
							</View> }
				<TicketResultModal
					tickets={this.state.userTickets}
					visible={this.state.modalVisible}
					onExit={() => this.setState({modalVisible: false})}
				/>
				</View>

						)
	}
}

const styles = StyleSheet.create({
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 30,
    zIndex: 1
  }
});
