import React from 'react'
import { View, TouchableHighlight, ImageBackground, StyleSheet } from 'react-native'
import { Text, Heading } from 'native-base'

export default class BasicCardItem extends React.Component { 

	static defaultProps = { 
		title: "Item",
		subtitleOne: "Cool St. San Francisco CA"
	}

	handleOnPress() { 
		if (this.props.onPress !== undefined) {
			this.props.onPress()
		}
	}

	render() { 
		return (
			<TouchableHighlight onPress={()=> this.handleOnPress()}>
			<View style={s.shadow}>
            <View style={{overflow: 'hidden', borderRadius: 8}}>
              <ImageBackground source={{uri: this.props.image}} style={s.backgroundImage}>
               <View style={s.overlay}/>
               <View style={{padding: 10, width: '100%'}}>
              		<Heading style={{color: 'white', fontWeight: 'bold'}}>{this.props.title}</Heading>
              		<Text style={{color: 'white'}}>{this.props.subtitleOne}</Text>
              		{this.props.subtitleTwo ? <View style={{display: 'flex',  flexDirection: 'row', justifyContent: 'space-between'}}>
              			<Text note style={{color:'white'}}>{this.props.subtitleTwo}</Text>
              		</View> : null}
                  <Text note style={{color: 'white', marginTop:20}}>{this.props.mutedText}</Text>
              	</View>
              </ImageBackground>
            </View>
          </View>
          </TouchableHighlight>
		)
	}

}

const s = StyleSheet.create({
  backgroundImage: {
      flex: 1,
      width: null,
      minHeight: 250,
      alignItems: 'flex-end',
      flexDirection: 'row'
  },
  shadow : { 
  	shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: 'gray',
    shadowOffset: { height: 0, width: 0 }, 
    borderRadius: 8
  }, 
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'black',
    opacity: 0.40
  }
});