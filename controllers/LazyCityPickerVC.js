import React from 'react'
import { View } from 'react-native'
import CityPickerModal from '../components/CityPickerModal'
import ZoneAPI from '../api/ZoneAPI'

export default class LazyCityPickerVC extends React.Component {

	static defaultProps = { 
		visible: false
		//OnExit
		//OnZoneSelect
	}

	constructor(props) { 
		super(props)

		this.state = { 
			loading: true,
			zones: this.props.zones
		}

		this.zonesApi = new ZoneAPI()
	}


	async componentDidMount() { 
		if (this.state.zones === null || this.state.zones === undefined)  {
			console.log("Zones are empty. Fetching")
			zoneDefault = await this.zonesApi.getZone('default');
			if (zoneDefault && zoneDefault.code !== -1) {
				console.log(zoneDefault)
				this.setState({zones: zoneDefault, loading: false});
			} else {
				console.log("Failed to get zone data");
			}
		}

	}

	render() { 
		return <CityPickerModal
				visible={this.props.visible} 
				zones={this.state.zones}
				onExit={(e) => this.props.onExit()}
				onZoneSelect={(e) => this.props.onSelect(e)}
		/>

	}
}