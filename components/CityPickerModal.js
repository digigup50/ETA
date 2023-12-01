import React from 'react'
import { FlatList, View, Modal, TouchableOpacity, SafeAreaView, ImageBackground, ScrollView } from 'react-native'
import { Text, Heading, Button, Spinner } from 'native-base'
import { AnalyticsManager, events } from '../api/Analytics'
import StylerInstance from '../managers/BaseStyler'

export default class CityPickerModal extends React.Component {

	constructor(props) {
		super(props)
	}


	componentDidMount() {
	}

	_onPress(item) {
		AnalyticsManager.logEvent(events.USER_CLICKED_CITY_PICKER)
		this.props.onZoneSelect(item)
	}

	getContent() {
		if (this.props.loading) {
			<View>
				<Spinner />
			</View>
		} else {
			return (
				<React.Fragment>
					<Button  variant={"ghost"} style={{ alignSelf: 'center' }} onPress={() => this.props.onExit()}>
						Exit
					</Button>

					<Heading style={{ fontWeight: 'bold', padding: 10, textAlign: 'center', color: StylerInstance.getOutlineColor() }}>Select a city</Heading>
					<View style={{ marginTop: 20, backgroundColor: StylerInstance.getBackgroundColor() }}>
						<FlatList
							data={this.props.zones}
							renderItem={(item, index) => this.renderCell(item.item)}
						/>
					</View>
				</React.Fragment>)
		}
	}


	renderCell(item) {
		console.log(item)
		return <TouchableOpacity onPress={() => this._onPress(item)}>
			<ImageBackground source={{ uri: item.image }} style={s.backgroundImage}>
				<View style={s.overlay} />
				<View style={s.center}>
					<Heading style={{ fontSize: 25, color: 'white', fontWeight: 'bold' }}>{item.name}</Heading>
				</View>
			</ImageBackground>
		</TouchableOpacity>

	}

	render() {
		return (<Modal
			animationType="slide"
			transparent={false}
			visible={this.props.visible}
			style={{ backgroundColor: StylerInstance.getBackgroundColor() }}
			onRequestClose={() => this.props.onExit()}>
			<SafeAreaView style={{ height: '100%', backgroundColor: StylerInstance.getBackgroundColor() }}>
				<ScrollView style={{ backgroundColor: StylerInstance.getBackgroundColor() }}>
					{this.getContent()}
				</ScrollView>
			</SafeAreaView>
		</Modal>)
	}
}

const s = {
	backgroundImage: {
		flex: 1,
		width: null,
		minHeight: 200,
		alignItems: 'flex-end',
		flexDirection: 'row'
	},
	overlay: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		backgroundColor: 'black',
		opacity: 0.40
	},

	center: {
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
		height: '100%'
	}
}