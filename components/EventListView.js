import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet, SectionList, Button, Dimensions} from 'react-native';
import { Heading } from 'native-base';
import EventCellView from './EventCellView';
import moment from 'moment';
import Carousel from 'react-native-snap-carousel';
import { getTimeZone } from '../managers/UtilsManager'
import { AnalyticsManager, events } from '../api/Analytics'
import StylerInstance from '../managers/BaseStyler';

export default class EventListView extends Component { 

static defaultProps = { 
		horizontal : false,
		fullSection: null
	}

	constructor(props) { 
		super(props)
		this.state = {
			currentItem : null,
			sectionShowMore : null,
			sections: null
		}	
	}

	makeSection() { 
		var sectionArr = []
		var dayMap = {}
		var dayShowMore = {}
		for (var event of this.props.events) { 
			const timeZone = getTimeZone(event)
			const day = moment.tz(event.start_date, timeZone).format('ddd, MMM D')
			if (dayMap[day] != null){
				dayMap[day].push(event)
			} else { 
				dayMap[day] = [event]
			}
			dayShowMore[day] = false
		}


		for (var key in dayMap) { 
			const keyData = dayMap[key].sort((a, b) => b.rank - a.rank)
			const section = {title: key, data: keyData}
			sectionArr.push(section)
			
		}

		this.setState({sectionShowMore: dayShowMore, sections:sectionArr})	
	}


	// const overrideRenderItem = (item, index) => {
	//   return (
	//     <FlatList
	//       showsHorizontalScrollIndicator={false}
	//       pagingEnabled={true}
	//       horizontal={true}
	//       data={item}
	//       keyExtractor={(item, index) => String(index)}
	//       renderItem={(
	//         ({item}) => this._renderItem2(item)
	//       )}
	//     />
	//   );
	// }

	componentDidMount() {
		console.log("MAKING SECTIONS")
		this.makeSection()
	}

	componentDidUpdate(prevProps) { 
		console.log(prevProps.extraData !== this.props.extraData)
		if (prevProps.extraData !== this.props.extraData) {
			this.makeSection()
		}
	}

	_getSectionHeader(title) { 
		//Return section header.
		// return (<H2 style={{marginBottom:10, marginTop:10, marginLeft: 10, color: StylerInstance.getOutlineColor()}}>
		// 	{title}
		// 	</H2>)
		return (<Heading style={{marginBottom:10, marginTop:10, marginLeft: 10, color: StylerInstance.getOutlineColor()}}>
				{title}
				</Heading>)

	}

	_showAllForSection(section) { 
		var currentSectionShowMore = this.state.sectionShowMore
		currentSectionShowMore[section.title] = true
		this.setState({sectionShowMore: currentSectionShowMore })
	}


	_renderItem(eventItem, index, section) { 
	//Return render item..	
	const START_EVENTS_PER_SECTION = 3
	const shouldShowAll = this.state.sectionShowMore[section.title]
	if (index == START_EVENTS_PER_SECTION && shouldShowAll == false) { 
		return (<Button title="See more Events" onPress={()=> {
			AnalyticsManager.logEvent(events.USER_CLICK_SEE_MORE)
			this._showAllForSection(section)
		}}/>)
	} 
	if (index > START_EVENTS_PER_SECTION && shouldShowAll == false){
		return null
	}
	return (
			<EventCellView
			event={eventItem}
			onPress={(val)=> this.onItemSelected(val)}
			onDispatchVideo={(video) => this.handleVideo(video)}/>
		)	
	}

	onItemSelected(event) { 
		this.props.onEventClicked(event)
	}

	handleVideo(video) { 
		this.props.onVideoClick(video)
	}

	getKey(item, index){ 
		return item.id.toString() 
	}

	getHorizontalRender(item, index) { 
		const windowSize = Dimensions.get('window')

		const section = this.state.sections[index]
		// return null
		return (
			<View>
			{this._getSectionHeader(item.title)}
				<View style={{paddingLeft: 10}}>
				<Carousel
	              ref={(c) => { this._carousel = c; }}
	              key={item.id}
	              data={item.data}
	              renderItem={({item, index}) => this._renderItem(item, index, section)}
	              sliderWidth={windowSize.width}
	              itemWidth={windowSize.width / 1.2}
	              style={{marginBottom: 20}}
	              contentContainerCustomStyle={{paddingLeft: 0}}
	            />
	            </View>
            </View>
            )
	} 


	render() { 
		if (this.state.sections == null) { 
			return (
				<Text> Loading.. </Text>
				)
		}

		if (this.props.horizontal) {
			if (this.props.noSections) { 
				const windowSize = Dimensions.get('window')
				return (
				<View style={{paddingLeft: 10}}>
					<Carousel
					  layout={'default'}
		              ref={(c) => { this._carousel = c; }}
		              data={this.props.events}
		              renderItem={(item, index) => <EventCellView
		              									key={item.item.id}
														event={item.item}
														onPress={(val)=> this.onItemSelected(val)}
														onDispatchVideo={(video) => this.handleVideo(video)}/>
													}
		              sliderWidth={windowSize.width}
		              itemWidth={windowSize.width / 1.2}
		              style={{marginBottom: 20}}
		              contentContainerCustomStyle={{paddingLeft: 0}}
	            	/>
            	</View>)
			} 
			
			return (
				<FlatList 
				data={this.state.sections}
				renderItem={({item, index}) => this.getHorizontalRender(item, index)}
				keyExtractor={(item, index) => index.toString()}
				/>
				)

		}

		if (this.props.noSections) { 
			return <FlatList
				data={this.props.events}
				renderItem={({item, index}) => <EventCellView
													event={item}
													onPress={(val)=> this.onItemSelected(val)}
													onDispatchVideo={(video) => this.handleVideo(video)}/>}
				keyExtractor={(item, index) => index.toString()}
			/>
		}

		return (
		<SectionList
		style={{...{backgroundColor: StylerInstance.choose('#f6f7f8', 'black')}, ...this.props.style}}
  		renderItem={({item, index, section}) => this._renderItem(item, index, section)}
  		renderSectionHeader={({section: {title}}) => (
  			this._getSectionHeader(title)
  		)}
  		sections={this.state.sections}
  		extraData={this.props.extraData}
  		onEndReachedThreshold={0.1}
		onEndReached={() => {
			if (this.props.onEndReached !== undefined) { 
				this.props.onEndReached()
			}
		}}
  		keyExtractor={(item, index) => 
  			this.getKey(item, index) } 
		/>

  		)
	}

}