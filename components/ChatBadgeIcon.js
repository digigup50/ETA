import React from 'react'
import BadgedIcon from './BadgedIcon'
import { Ionicons } from '@expo/vector-icons';
import { connect } from 'react-redux'

class ChatBadgeIcon extends React.Component { 

	render() { 
		return <BadgedIcon count={this.props.chatNotificationCount}>
		    <Ionicons name="md-chatbubbles" style={{color:this.props.tintColor, fontSize:this.props.fontSize}} />
		</BadgedIcon> 
	}
}

const mapStateToProps = (state) =>  { 
	const { chatNotificationCount } = state
	return { chatNotificationCount }
}


export default connect(mapStateToProps)(ChatBadgeIcon)