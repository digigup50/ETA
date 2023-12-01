import {get, put, post, nonJsonPost} from './BaseAPI';
import BaseAPIV2 from './BaseAPIV2';

export default class ScanAPI extends BaseAPIV2 {

	async scan(key, success, failure) { 
		return await super.get("/scan/v2/" + key);
	}
}