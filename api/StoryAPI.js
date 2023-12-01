import {get, post} from './BaseAPI';
import BaseAPIV2 from './BaseAPIV2';

export default class StoryAPI extends BaseAPIV2 {

	async getStories(zone, success, fail) { 
		var url = "/articles"
		if (zone) { 
			url += "?zone=" + zone 
		}
		return await super.get(url);
	}
}