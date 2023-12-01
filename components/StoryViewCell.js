import React from 'react'
import { View, Text, Image, ImageBackground, StyleSheet, Linking, TouchableHighlight, Dimensions } from 'react-native'
import Carousel from 'react-native-snap-carousel';

export default class StoryViewCell extends React.Component { 

	constructor(props) { 
		super(props)
		this.state = { 
			entries: [{title: 'Hi'}, {title: "Yoo"}, {title: "whats popping"}]
		}
	}




 _renderItem ({item, index}) {
        return (
        	<TouchableHighlight onPress={() => this.props.handlePress(item)}>
	        	<ImageBackground 
	        		style={s.backgroundImage}
	          		source={{uri: item.image}}>
	          		<View/>
	          			<View style={{backgroundColor: 'black'}}>
	                	<Text style={{color: 'white', margin: 5, fontSize: 20}}>{item.caption}</Text>
	                	<Text style={{color: 'white', margin: 5}}>{item.subheading}</Text>
	                	</View>

	        	</ImageBackground>
        	</TouchableHighlight>

        );
    }

    render () {
    	const windowSize = Dimensions.get('window')
        return (
            <Carousel
              ref={(c) => { this._carousel = c; }}
              data={this.props.stories}
              renderItem={(item, index) => this._renderItem(item, index)}
              sliderWidth={windowSize.width}
              itemWidth={windowSize.width / 1.3}
              style={{marginBottom: 20}}
              removeClippedSubviews={false}
              autoplay
              autoplayInterval={12000}
            />
        );
    }
}

const s = StyleSheet.create({
  backgroundImage: {
      flex: 1,
      width: null,
      height: Dimensions.get('window').height / 2,
      alignItems: 'flex-end',
      flexDirection: 'row'
  },
  shadow : { 
  	shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: 'gray',
    shadowOffset: { height: 0, width: 0 }
  }, 
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'black',
    opacity: 0.30
  }
});