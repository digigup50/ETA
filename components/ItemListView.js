import React from 'react'
import Carousel from 'react-native-snap-carousel';
import { View, Dimensions, Linking } from 'react-native'
import PlaceCellView from './PlaceCellView'
import BasicCardItem from './BasicCardItem';

export default class ItemListView extends React.Component { 

	handleItemPressed() { 
		console.log("item pressed")
	}


	getItemRender(item) {
		const realItem = item.item;
		if (this.props.kind === "place") { 
			return <PlaceCellView
						place={realItem}
						onPress={() => Linking.openURL(realItem.link)}
					/>
		} else if (this.props.kind === "raw_item") {
			return <BasicCardItem
				title={realItem.title}
				subtitleOne={realItem.subtitle_one}
				subtitleTwo={realItem.subtitle_two}
				image={realItem.image}
				onPress={() => realItem.link ? Linking.openURL(realItem.link) : null}
			/>
		} else { 
			console.log("Attempting to view event with ItemListView. Not integrated.")
			return null
		}
	}

	render() { 
		const windowSize = Dimensions.get('window')
		if (this.props.horizontal) { 
				return (
				<View style={{paddingLeft: 10}}>
					<Carousel
					  layout={'default'}
		              ref={(c) => { this._carousel = c; }}
		              data={this.props.items}
		              renderItem={(item, index) => this.getItemRender(item)}
		              sliderWidth={windowSize.width}
		              itemWidth={windowSize.width / 1.2}
		              style={{marginBottom: 20}}
		              contentContainerCustomStyle={{paddingLeft: 0}}
	            	/>
            	</View>)
		}
	}
}