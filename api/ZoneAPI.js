import {get, put, post, nonJsonPost} from './BaseAPI';
import BaseAPIV2 from './BaseAPIV2';

export default class ZoneAPI extends BaseAPIV2 { 
	async getCoordinates() {
		try {
			const data = await fetch(`https://pro.ip-api.com/json/?key=lzefIV1z5dLD453`, {
				mode: 'cors',
				headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				}
			})
				.then((res) => {
					if (!res.ok) {
						const errorBody = res.json()
						console.log("SOMETHING WENT WRONG")
						return errorBody.then(Promise.reject.bind(Promise))
					}
					console.log("RESPONSE IS OKAY")
					return res.json();
				})
				.catch((error) => { return error })

			return data
		} catch {
			return undefined
		}
	}
	
	async getZonesAndTopEvents(success, failure) { 
	 	return await super.get("/zones/top_events");
	}

	async getZone(zone, success, failure) { 
		console.log('calling getZone with zone', zone)
		var url = "/zones"
		if (zone !== undefined && zone !== null) { 
			url += "?zone=" + zone
		}
		return await super.get(url);
	}

	async getZoneWithCoordinates(coor, success, failure) { 
		var url = "/zones"
		console.log('coordinates', coor)
		if (coor.lat !== undefined && coor.lat !== null) { 
			url += "?lat=" + coor.lat + "&lon=" + coor.lon 
		}
		return await super.get(url);
	}

	async getConfig(zoneSlug, types) { 
		return await super.get(`/config?zone_slug=${zoneSlug}&context=${types.toString()}`);
	}
}