import React from 'react'
import MainUser from '../components/MainUser'
import { Heading, Text, Button, Spinner } from 'native-base'
import { View, Alert, FlatList } from 'react-native' 
import * as Linking from 'expo-linking'
import UserAPI from '../api/UserAPI'
import EventListView from '../components/EventListView'
import EventCellView from '../components/EventCellView'
import CenteredView from '../components/CenteredView'
import { connect } from 'react-redux'
import { overwrite } from '../store'
import { AnalyticsManager, events } from '../api/Analytics'
import StylerInstance from '../managers/BaseStyler'
import * as Sentry from 'sentry-expo';

class MyTicketsScreen extends React.Component { 
	

	constructor(props) { 
		super(props)

		this.state = { 
			verified: false,
			emailSent: false, 
			tickets: [],
			loading: false,
			refreshing: false
		}

		this.userApi = new UserAPI()
	}

	isUserEmailVerified(user) { 
		if (user === null){ 
			return false
		}

		return (user.email_verified === true)
	}

	async getTickets() { 
		this.setState({loading: true})
		const ticketResults = await this.userApi.getTickets();
		console.log('tickets', ticketResults)
		if (ticketResults && ticketResults.code !== -1) { 
			this.setState({tickets: ticketResults, loading: false});
		} else { 
			if (this.isUserEmailVerified(this.props.user)) { 
				Alert.alert("Something went wrong. Try again in a few.");
			}

			this.setState({loading: false});

		}
	}
	
	_handleOpenURL(url){ 
		if (!url) { 
			console.log(`No url entered. Url is ${url}`)
			return
		}
		if (typeof url !== "string") {
			Sentry.Native.addBreadcrumb(url);
			Sentry.Native.captureMessage("Calling _handleOpenUrl with non-string url");
			return;
		}
		let { path, queryParams } = Linking.parse(url);
		this.reloadUser()
	}


	componentDidMount() { 
		const didFocusSubscription = this.props.navigation.addListener(
  			'focus', payload => {
  				AnalyticsManager.logEvent(events.USER_CLICK_MY_TICKETS_TAB);
				this.getTickets();
  			}
		)
		this.setState({subscription: didFocusSubscription})
		
		Linking.getInitialURL().then((url) => {
			this._handleOpenURL(url)
		}).catch(err => Sentry.Native.captureException(err));
	
		this._linkingListener = Linking.addEventListener('url', this._handleOpenURL.bind(this));

		if (this.props.user !== null && this.isUserEmailVerified(this.props.user))  {
			console.log("USER HAS EMAILED ALREADY VERIFIED")
			this.getTickets()
		}
	}

	componentWillUnmount() { 
		this._linkingListener.remove();
		const sub = this.state.subscription
		if (sub && typeof sub === "function") {
			sub();
		}
	}

	async sendVerificationEmail() { 
		console.log("Sending verification email")
		let redirectUrl = Linking.makeUrl('user/email_verification');

		weak = this
		const ticketResults = await weak.userApi.sendEmailAuth(this.props.user.email, redirectUrl);
		if (ticketResults && ticketResults.code !== -1) { 
			this.setState({emailSent: true});
		} else { 
			Alert.alert(
				"Something went wrong",
				"Sorry, we weren't able to send your email a verification code. Try again later" )
		}
	}


	maybeGetTickets(user, weakThis) { 
		weakThis.props.dispatch(overwrite(user))
		if (weakThis.isUserEmailVerified(user) === true)  { 
		    weakThis.getTickets()
		} else { 
			console.log("USER IS NOT VERIFIED")
			weakThis.setState({verified: false})
		}
	}

	async reloadUser() { 
		console.log("lOADING USER VIA API FOR MYTICKETSSCREEN");
		const myUser = await MainUser.loadUserFromApiAsync();
		if (myUser) { 
			this.maybeGetTickets(myUser, this)
		} else { 
			Alert.alert(
				"Something went wrong",
				"Sorry, we couldn't refresh your account. Try again later" )
		}
	}

	handleTicketClick(data) { 

		console.log("Handling ticket click.")

		let order = this.state.tickets.find(function(obj) { 
			return obj.event.id === data.id
		})

		console.log("order is..")
		console.log(order)

		if (order === null) { 
			console.log(`Order could not find event with ${data}`)
		}


		this.props.navigation.navigate('TicketDetail', {
			'order': order
		})
	}

	getContent(verified) { 
		if (verified) { 
			if (this.state.tickets.length == 0) { 
				console.log("User has no tickets")
				return (
					<CenteredView style={{flex:1}}>
						<Heading style={{fontWeight:'bold', marginBottom: 10, color: StylerInstance.getOutlineColor()}}
						>No current tickets</Heading>
						<Text style={{color: StylerInstance.choose('gray', 'white')}}>...</Text>
				</CenteredView>)
			}
		}

		if (this.state.emailSent) { 
			return (<React.Fragment>
						<Heading style={{fontWeight:'bold', textAlign: 'center', marginBottom: 10, color: StylerInstance.getOutlineColor()}}>Check your email</Heading>
						<Text style={{color: StylerInstance.choose('gray', 'white')}}>We sent a verification code to</Text>
						<Text style={{color: StylerInstance.getOutlineColor()}}>{this.props.user.email}</Text>
						<Text style={{color: StylerInstance.choose('gray', 'white'), textAlign: 'center'}}>Click refresh after clicking the link in the email</Text>
						<Button bordered style={{marginTop: 20, alignSelf: 'center'}}
						onPress={() => this.reloadUser()}><Text>Refresh</Text></Button>

						<Button borderded dark style={{marginTop: 20, alignSelf: 'center'}}
							onPress={() => this.setState({emailSent: false})}><Text>Back</Text></Button>
				</React.Fragment>)
		}

		if (!this.state.verified) { 
			return (
				<React.Fragment>
						<Heading style={{fontWeight:'bold', textAlign: 'center', marginBottom: 10, color: StylerInstance.getOutlineColor()}}
						>Verify your email to access your tickets</Heading>
						<Text style={{color: StylerInstance.choose('gray', 'white')}}>Stop sleeping on easy check-in.</Text>	
						<Text style={{color: StylerInstance.choose('gray', 'white')}}>{this.props.user && this.props.user.email}</Text>											
						<Button bordered style={{alignSelf: 'center', marginTop: 20}}
						onPress={() => this.sendVerificationEmail()}><Text>Verify email</Text></Button>
				</React.Fragment>
			)
		}
	}

	renderEvent(item) { 
		return <EventCellView
							key={item.event.id}
					 		event={item.event}
					 		order={item}
					 		onPress={(val)=> this.handleTicketClick(val)}
					 	/>
	}

	keyExtractor(item, index) { 
		return item.id.toString()
	}

	render() { 
		const verified = this.isUserEmailVerified(this.props.user)

		if (this.state.loading === true) { 
			return <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: StylerInstance.getBackgroundColor()}}>
					<Spinner />
				</View>
		}

		if (verified && this.state.tickets.length > 0) {
				return (
					<FlatList
					  removeClippedSubviews
					  data={this.state.tickets}
					  renderItem={(item, index) => this.renderEvent(item.item)}
					  keyExtractor={(item, index) => this.keyExtractor(item, index)}
					  maxToRenderPerBatch={5}
					  initialNumToRender={5}
					  contentContainerStyle={{backgroundColor: StylerInstance.getBackgroundColor()}}
					/>)
		}

		return <CenteredView 
		style={{flex:1, paddingLeft: '5%',
		textAlign: 'center', paddingRight: '5%', backgroundColor: StylerInstance.getBackgroundColor()}}
		>{this.getContent(verified)}</CenteredView>
	}
}

const mapStateToProps = (state) => { 
	const { user } = state
	return { user }
}

export default connect(mapStateToProps)(MyTicketsScreen)