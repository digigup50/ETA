import React from 'react'
import EventListView from './EventListView'
import { View} from 'react-native'
import { Heading, Button, Text } from 'native-base'
import ItemListView from './ItemListView'
import StylerInstance from '../managers/BaseStyler'

export default class Section extends React.Component { 

	static defaultProps = {
		itemKind : 'event'
	}

	componentDidMount() { 
		console.log("Section mounting")
		console.log(this.props.events)
	}

	getSectionItemView() { 
		if (this.props.itemKind === "event" || this.props.itemKind == undefined || this.props.itemKind === null) { 
			return <EventListView
						noSections
						horizontal
						events={this.props.items}
						onEventClicked={(data) => this.props.handleEventClick(data)}
						onVideoClick={(video) => this.props.handleVideoClick(video)}
					/>
		}

		return <ItemListView
					horizontal
					items={this.props.items}
					kind={this.props.itemKind}
					onItemClicked={({id, kind}) => this.props.handleItemClick(id, kind)}
				/>

	}

	getSeeMoreButton() { 
		return <View style={{flexDirection: 'row',justifyContent: 'center', marginTop: 20, marginBottom: 20}}>
						<Button variant={"subtle"} info style={{width:'80%', justifyContent: 'center'}}
							onPress={() => this.props.onSeeMoreClicked(this.props.section)}>See more</Button>
					</View>
	}

	render() { 
		if (this.props.itemKind !== "event" && this.props.itemKind !== "place" && this.props.itemKind !== "raw_item") { 
			return null
		}

		return (<View style={[this.props.style, {backgroundColor: StylerInstance.getBackgroundColor()}]}>
					<View style={{paddingLeft: 10}}>
						<Heading style={{fontWeight: 'bold', fontSize: 26, marginBottom: 10, color: StylerInstance.getOutlineColor()}}>{this.props.title}</Heading>
						{this.props.subtitle && <Text style={{color: StylerInstance.choose("gray", "white"), marginBottom: 20}}>{this.props.subtitle}</Text>}
					</View>
				{this.props.items !== undefined && this.props.items !== null && 
					this.getSectionItemView()
				}
					{this.props.showMore !== undefined && <View style={{alignItems: 'center', marginTop: 20}}>
						<Button bordered style={{width: '40%', justifyContent: 'center'}}>See More</Button>
					</View>}
					{this.props.kind === "automatic_section" && this.getSeeMoreButton()}
				</View>)
	}
}