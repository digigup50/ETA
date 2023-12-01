import Popup from './Popup'
import React from 'react'
import { View, ScrollView } from 'react-native'
import { Heading, Text, Container, Button, Badge } from 'native-base'	
import { TouchableHighlight } from 'react-native'
import StylerInstance from '../managers/BaseStyler'

export default class EventFilterModal extends React.Component { 

	static defaultProps = {
		selectedTime: "Any time",
		selectedCategories: [],
		options: null, 
		tags: [],
		selectedTags: []
	}

	constructor(props) { 
		super(props)
		this.state = { 
			time: this.props.selectedTime,
			selectedCategories: this.props.selectedCategories,
			tags: [], 
			selectedTags: this.props.selectedTags
		}
	}

	handleOnPress(key, type) { 
		console.log("handling on press")
		if (type === "time"){
			this.setState({time: key})
		} else if (type == "category") { 
			var categories = [...this.state.selectedCategories]
			if (categories.includes(key)) { 
				categories = categories.filter(item => item !== key)
			} else {
				categories.push(key)
			}
			this.setState({selectedCategories: categories})
		} else { 
			var tags = [...this.state.selectedTags]
			const exists = tags.find(e => e.identifier == key.identifier);
			if (exists) { 
				tags = tags.filter(item => item !== exists);
			} else {
				tags.push(key);
			}
			this.setState({selectedTags: tags})
		}
	}

	getTimeFilter() { 
					// <View style={{marginBottom: 20}}>
				// 	<Text style={{marginBottom: 10, fontWeight: 'bold'}}>Time</Text>
				// 	<ScrollView horizontal>
				// 		{this.getButton("Today", "time")}
				// 		{this.getButton("This Week", "time")}
				// 		{this.getButton("This Weekend", "time")}
				// 		{this.getButton("Any Time", "time")}
				// 	</ScrollView>
				// </View>
	}

	getButton(key, type) { 
		var isInfo = true;
		var keyLabel = key;
		if (type == "tag") { 
			keyLabel = key.label;
			if (this.state.selectedTags.find(e => e.identifier == key.identifier)) { 
				isInfo = false;
			}
		}

		if (type == "category" || type == "time") { 
			if (this.state.time === key || this.state.selectedCategories.includes(key)) { 
				isInfo = false;
			} 
		}

		return <TouchableHighlight
			onPress={() => this.handleOnPress(key, type)}
			><Badge info={isInfo} primary={!isInfo} style={{marginRight: 8, marginTop: 5}}><Text>{keyLabel}</Text></Badge></TouchableHighlight>
	}

	render() { 
		return <Popup
			visible={this.props.visible}
			onExit={() => this.props.onExit()}
			includeExit>
				<View style={{backgroundColor: StylerInstance.getBackgroundColor(), padding: 10, marginBottom: 20, widht: '100%'}}>
					<Heading style={{textAlign: 'center', color: StylerInstance.getOutlineColor()}}>Filter</Heading>
					<View>
						<Text style={{marginBottom: 10, fontWeight: 'bold', color: StylerInstance.getOutlineColor()}}>Event Type</Text>
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						{this.props.options && this.props.options.map((item, index)=> 
								this.getButton(item, "category")
							)}
						</ScrollView>
					</View>
					<View style={{marginTop: 20, maxWidth: '100%'}}>
						<Text style={{marginBottom: 10, fontWeight: 'bold', color: StylerInstance.getOutlineColor()}}>Tags</Text>
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						{this.props.tags && this.props.tags.map((item, index)=> 
								this.getButton(item, "tag")
							)}
						</ScrollView>
					</View>
			</View>
			<View style={{flexDirection: 'row',justifyContent: 'center'}}>
				<Button  variant="outline" style={{width:'80%', justifyContent: 'center'}}
							onPress={() => this.props.onFinish(this.state.selectedCategories, this.state.time, this.state.selectedTags)}>Okay
						</Button>
			</View>
			<View style={{flexDirection: 'row',justifyContent: 'center', marginTop: 20}}>
				<Button variant="subtle"  colorScheme="primary" style={{width:'80%', maxHeight:35, justifyContent: 'center'}}
							onPress={() => this.props.onExit()}>
							Cancel
						</Button>
			</View>
		</Popup>
	}
}