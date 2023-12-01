import React, {Component} from 'react'
import { Video, Audio } from 'expo-av'; 
import { View, SafeAreaView, Linking, Dimensions, Modal, StyleSheet } from 'react-native';
import { AnalyticsManager, events} from '../api/Analytics'
import { MaterialIcons } from '@expo/vector-icons'

export default class VideoPlayer extends Component { 

	constructor(){
		super()
	}

	componentDidMount() { 
		Audio.setAudioModeAsync({
		allowsRecordingIOS: false, 
		staysActiveInBackground: false,
 		 playsInSilentModeIOS: true,
 		 interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS, 
 		 shouldDuckAndroid: true, 
 		 interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS, 
 		 playThroughEarpieceAndroid: true
		});
	}

	render() { 
		const { width, height } = Dimensions.get('window');
   		return (
   		<Modal
	        animationType="fade"
	         transparent={false}
	          visible={this.props.visible}
	          onShow={() => 
	          	AnalyticsManager.logEvent(events.USER_WATCHED_VIDEO)
	          }
	          onDismiss={()=> 
	          	console.log("Video player component will exit")
	          }
	          onRequestClose={() => {
	          }}>
	          <SafeAreaView style={styles.container}>
	    	 	<Video
	            source={{uri: this.props.videoUrl}}
	            rate={1.0}
	            volume={1.0}
	            isMuted={false}
	            resizeMode={'contain'}
	            shouldPlay
	            isLooping
	            style={{width: width, height: height, position:'absolute', top: 0, left:0, bottom:0, right:0}}
	            />
	            
	            <View style={styles.content}>
	            <MaterialIcons name="cancel" type="MaterialIcons" size={32} style={{color:'red'}}
	            onPress={()=> this.props.onExitClick()}/>
        		</View>

	          </SafeAreaView>
	        </Modal>
	      )
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black'
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  content: {
    flex: 1, 
    margin: 10
  }
});