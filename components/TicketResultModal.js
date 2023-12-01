import React from 'react'
import { View, Modal, Button, Text } from 'react-native'
import { Icon } from 'native-base'
import moment from 'moment'

export default class TicketResultModal extends React.Component { 

  static defaultProps = {
    alreadyScanned: false,
    tickets: [],
    visible: false
  }

	constructor(props) { 
		super(props)
		this.state = { 
		}
	}


  timeSinceScan(scanned_at) { 
    return moment(scanned_at).startOf('minute').fromNow()
  }

  getTicketString(item, includeScan=false) { 
    return `${item.ticket_group.title} - ${item.first_name} - ${item.last_name} - ${this.timeSinceScan(item.scanned_at)}`
  }

	getBody() { 
    console.log("IN BODY======")
    console.log(this.props.tickets)
    if (this.props.alreadyScanned === true) { 
      return <View style={{display: 'flex', justifyContent:'center', alignItems: 'center'}}>
              <Icon name="error" type="MaterialIcons" style={{fontSize: 60}}/>
              <Text style={{fontSize: 25, fontWeight: 'bold'}}>Already scanned</Text>
              {this.props.tickets.map((item, index) => {
                if (item.count !== 0){
                    return <View key={index}>
                    <Text style={{fontSize: 20}}>{item.title} x {item.count}</Text>
                    <Text style={{fontSize: 20}}>Scanned {this.timeSinceScan(item.scanned_at)}</Text>
                    </View>

                }
              }
            )}
      </View>
    }

		if (this.props.tickets !== undefined || this.props.tickets.length() !== 0) {
			return <View style={{display: 'flex', justifyContent:'center', alignItems: 'center'}}>
			   <Icon name="check-circle" type="FontAwesome" style={{fontSize: 60}}/> 
              <Text style={{fontSize: 25, fontWeight: 'bold'}}>Valid ticket</Text>
              {this.props.tickets.map((item, index) => {
                if (item.count !== 0){
                		return <Text style={{fontSize: 20}} key={index}>{item.title} x {item.count}</Text>
            		}
            	}
            )}
			</View>
		} else { 
			return this.getErrorView()
		}
	}

  getErrorView()  { 
    return <View style={{display: 'flex', justifyContent:'center', alignItems: 'center'}}>
        <Icon name="error" type="MaterialIcons" style={{fontSize: 60}}/> 
           <Text style={{fontSize: 25, fontWeight: 'bold'}}>Ticket is not valid</Text>
           <Text style={{fontSize: 20}}> We do not recognize this ticket</Text>
           </View>
  }

	render() { 
		return (
			<View style={{marginTop: 22}}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.props.visible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View style={{marginTop: 120, backgroundColor: 'white', minHeight: '20%', minWidth: '80%', maxWidth: '100%', alignSelf: 'center', justifyContent:'center',
          borderWidth: 2}}>
            <View style={{display: 'flex', justifyContent:'center', alignItems: 'center'}}>
             {this.getBody()}
             <Button
              onPress={()=> this.props.onExit()}
             title="OK"
             />
            </View>
          </View>
        </Modal>
      </View>
			)
	}
}