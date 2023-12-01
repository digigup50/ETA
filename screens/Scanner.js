import React from 'react';
import { StyleSheet, Text, View, Linking, TouchableOpacity, Dimensions, LayoutAnimation } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions  from 'expo-permissions'
import { get } from '../api/BaseAPI'
import { Alert, Modal, TouchableHighlight, Button } from 'react-native'
import { Icon } from 'native-base'
import ScanAPI from '../api/ScanAPI'
import TicketResultModal from '../components/TicketResultModal'
import * as Sentry from 'sentry-expo';

export default class ScannerScreen extends React.Component {
state = {
    hasCameraPermission: null,
    lastScannedUrl: null,
    popUpActive: false,
    event: null,
    modalVisible: false, 
    tickets: [], 
    alreadyScanned: false,
    activelyScanning: false
  };

  componentDidMount() {
    this._requestCameraPermission();
    const event = this.props.route.params.event || null;
    this.setState({event: event})
    console.log(event)
  }

  _requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted',
    });
  };

  _handleBarCodeRead = result => {
    console.log("SOMETHING SCANNED MANN")
    this.handleScanResult(result)
  };

  handleFail() { 
    this.setState({popUpActive: false, activelyScanning: false})
  }

  handleFailScan(scan, extra = "") { 
    // console.log(scan)
    console.log('GETTING CALLED SOMEHOW')
      if (this.state.popUpActive == false) { 
          this.setState({popUpActive: true})
          Alert.alert("Invalid Ticket", 
                      "We could not find this order in our system." + extra,
                        [
                          {text: 'OK', onPress: () => this.handleFail()},
                        ]
                      )
        } 
  }

  handleSuccessScan(scan, data) { 
    if (this.state.popUpActive == false) { 
      this.setState({popUpActive: true})
      Alert.alert("Success!", 
                  "This is a valid ticket", 
                    [
                      {text: 'OK', onPress: () => this.setState({popUpActive: false})},
                    ]
              )
      }
  }

  async parseResultNew(scan, data) { 
    console.log("======GETTING SCAN RESULT DATA======")
    try {
      var tickets = null
      if (data.scanned_at === undefined) { 
        // Order
        tickets = data.tickets
      } else {
        //Ticket
        tickets = [data]
      }
      var ticket = tickets[0]
      const alreadyScanned = ticket !== undefined && ticket !== null && ticket.scanned_at !== undefined && ticket.scanned_at !== null
      this.setState({alreadyScanned: alreadyScanned})
      if (alreadyScanned) { 
        this.setState({modalVisible: true, tickets: this.getOrderTicketGroupCount(tickets)})
      }

      if (!alreadyScanned) { 
        console.log("=======NOT ALREADY SCANNED..SCANNING NOW=======")
        const scanApi = new ScanAPI()
        const result = await scanApi.scan(data.id)
        if (result && result.code !== -1) { 
          this.parseResult(scan, result);
        } else { 
          this.handleFailScan(result.error, ".");
        }
      }
    } catch (error) { 
      Sentry.Native.captureMessage(error.message)
    }
  }

  parseResult(scan, data) { 
    console.log("=====THIS IS PARSE RESULT========")
    console.log(data)
    console.log(data.event.id)
    console.log(this.state.event.id)

    if (data.event.id === this.state.event.id) { 
      // this.handleSuccessScan(scan, data)
      console.log("THEY ARE EQUAL")
      try {
          const ticketGroupCount = this.getOrderTicketGroupCount(data.tickets)
          console.log(ticketGroupCount)
          this.setState({modalVisible:true, tickets:ticketGroupCount})
      return
        } catch (err) {
          // Error handling
          console.log(err)
        }
    } else {
      this.handleFailScan(scan, "..")
    }
  }

  handleScanResult(result) { 
    console.log(result);
    if (this.state.activelyScanning == true) { 
      console.log("ACTIVELY SCANNNG");
      return
    } 

    this.setState({activelyScanning: true})
    const url = result.data
    const weak = this
    console.log(result)
    get(url, 
      (data) => this.parseResultNew(result, data), 
      (error) => this.handleFailScan(error),
      url) 
  }

  render() {
    const modal = <TicketResultModal
          tickets={this.state.tickets}
          visible={this.state.modalVisible}
          alreadyScanned={this.state.alreadyScanned}
          onExit={() => this.handleModalClose()}
          />
    return (
      <View style={styles.container}>

        {this.state.hasCameraPermission === null
          ? <Text>Requesting for camera permission</Text>
          : this.state.hasCameraPermission === false
              ? <Text style={{ color: '#fff' }}>
                  Camera permission is not granted
                </Text>
              : <BarCodeScanner
                  onBarCodeScanned={this._handleBarCodeRead}
                  style={{
                    height: Dimensions.get('window').height,
                    width: Dimensions.get('window').width,
                  }}
                />}
        {modal}
        <StatusBar hidden />
      </View>
    );
  }

  getOrderTicketGroupCount(tickets) { 
    const resultArr = []
    console.log(tickets)
    const myMap = {}
    for (var val of tickets) { 
      if (myMap[val.ticket_group.title] === undefined) { 
        myMap[val.ticket_group.title] = 1
      } else { 
        myMap[val.ticket_group.title] += 1
      }
    }

  for (var x in myMap) { 
    console.log("WATTUP")
     const object = {
        title: x, 
        count: myMap[x],
        scanned_at: tickets[0].scanned_at
      }
      console.log(object)
      resultArr.push(object)
  }

    console.log("LEAVING FOR LOOP")

    console.log(resultArr)
    return resultArr
  }

  handleModalClose() {
    this.setState({modalVisible: false, activelyScanning: false}) 
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    flexDirection: 'row',
  },
  url: {
    flex: 1,
  },
  urlText: {
    color: '#fff',
    fontSize: 20,
  },
  cancelButton: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
  },
});