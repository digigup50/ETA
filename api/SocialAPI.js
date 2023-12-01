import {get, put, post, patch, nonJsonPost, nonTokenpost} from './BaseAPI';
import { combineParams } from '../managers/UtilsManager'
import BaseAPIV2 from './BaseAPIV2';
//TODO: Status code validation + messages

export default class SocialAPI extends BaseAPIV2 { 
	async loginWithSocial(data) { 
		return await super.post('/account', data);
	}
}