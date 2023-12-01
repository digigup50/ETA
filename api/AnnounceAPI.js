import {get, put, post, nonJsonPost} from './BaseAPI';
import { combineParamsV2 } from '../managers/UtilsManager'
import BaseAPIV2 from './BaseAPIV2';


export default class AnnounceAPI extends BaseAPIV2 { 

	async getAnnouncement({zone=null}) { 
		var url = "/announcements"
		const params = []
 		if (zone !== null) {
 			params.push({
 			zone: zone
 			})
 		}
 		url += combineParamsV2(params)
 		return await super.get(url);
	}



}