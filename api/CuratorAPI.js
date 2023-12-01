import {get, put, post, nonJsonPost} from './BaseAPI';
import BaseAPIV2 from './BaseAPIV2'

export default class CuratorAPI extends BaseAPIV2 { 

	async getCurators(zone, success, failure) { 
		var url = "/curator"
		if (zone !== undefined && zone !== null) { 
			url += "?zone=" + zone
		}
		return await super.get(url);
	}
}