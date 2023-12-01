import React from 'react'
import {  View, Image, Dimensions } from 'react-native'
import { Text, Heading, Button } from 'native-base'
import Popup from './Popup'
import Constants from '../constants/GlobalStyles'
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { AnalyticsManager, events } from '../api/Analytics'
import AsyncStorage from '@react-native-async-storage/async-storage';
import StylerInstance from '../managers/BaseStyler'

export default class NewProductModal extends React.Component { 

	static defaultProps = {
		entries: [{title: 'Introducing City Chats'}, {title: "Yoo"}, {title: "whats popping"}]
	}

	constructor(props) { 
		super(props)

		this.state = { 
			activeIndex: 0,
			visible: false
		}
		this.key = "announcements"
		this.newKey = props.productKey;
	}

	async componentDidMount() { 
		try {
			const value = await AsyncStorage.getItem(this.key);
			if (value === null || value === undefined) { 
				this.setState({visible: true})
			} else { 
				const currentValue = JSON.parse(value)
				if (!currentValue || currentValue[this.newKey] === null || currentValue[this.newKey] === undefined) { 
					this.setState({visible: true})
				}
			}
		} catch (error) { 
			console.log("Error when fetching last chat view time")
		}

	}


	onExit() {
		const val = {}
		val[this.newKey] = true
		AsyncStorage.setItem(this.key, JSON.stringify(val))
		AnalyticsManager.logEvent(events.USER_CLOSED_ANNOUNCEMENT)
		this.setState({visible: false})
	}

	renderItem(item, index) { 
		console.log(item)
		return <View style={{...Constants.centerView, ...{marginTop: 10}}}>
				<View>
					{/* <H2 style={{textAlign: 'center', marginTop: '5%', marginBottom: '5%', fontWeight: 'bold', color: StylerInstance.getOutlineColor()}}>{item.item.title}</H2> */}
					<Heading style={{textAlign: 'center', marginTop: '5%', marginBottom: '5%', fontWeight: 'bold', color: StylerInstance.getOutlineColor()}}>{item.item.title}</Heading>

					<Text style={{textAlign: 'center', color: StylerInstance.getOutlineColor()}}>{item.item.data}</Text>
				</View>
			</View>
	}



	render() {
		const windowSize = Dimensions.get('window')

		return (
			<Popup
				visible={this.state.visible}
				borderRadius={20}
				onExit={() => this.onExit()}>
            <Carousel
              data={this.props.entries}
              renderItem={(item, index) => this.renderItem(item, index)}
              sliderWidth={windowSize.width/1.15}
              itemWidth={windowSize.width / 1.5}
              removeClippedSubviews={false}
              style={{marginTop: 40}}
              onSnapToItem={(index) => this.setState({ activeIndex: index }) }

            />
            {this.props.entries.length > 1 && <Pagination
                  dotsLength={this.props.entries.length}
                  activeDotIndex={this.state.activeIndex}
                />}
            <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 10}}>
             <Button onPress={() => this.onExit()}
             	style={{width: '80%'}}>
            	Got it
             </Button>
            </View>
			</Popup>) 

	}
}