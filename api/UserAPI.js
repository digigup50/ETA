import {get, put, post, patch, nonJsonPost} from './BaseAPI';
import { combineParams } from '../managers/UtilsManager'
import BaseAPIV2 from './BaseAPIV2';
//TODO: Status code validation + messages

export default class UserAPI extends BaseAPIV2 { 

	constructor() { 
		super(null, null);
	}

	async sendAuth(mobile) {
		const mobileBody = "mobile=" + mobile
		console.log(mobileBody)
		return await super.nonJsonPost('/auth/mobile/', mobileBody);
	}

	async sendEmailAuth(email, link) {
		const emailBody = "email=" + email + "&link=" + link
		console.log(emailBody)
		return await super.nonJsonPost('/auth/email/', emailBody);
	}

	async validateAuth(code) { 
		const tokenBody = "token=" + code
		return await super.nonJsonPost('/callback/auth/', tokenBody)
	}

	async sendPhoneToken(token) { 
		const data = { token: token }
		return await super.post('/me/phone_token', data);
	}

	async partialUpdate(userId, params) { 
		return await super.partialUpdate('/me/' + userId, params);
	}

	async getUserEventsChats(version=null, expansions=null) { 
		params = []
		var url = "/me/chats"
		if (version !== null) { 
			params.push({
				title: 'version',
				value: version
			})
		}
		if (expansions) { 
			params.push({
				title: 'expansions', 
				value: expansions.toString()
			})
		}
		url += combineParams(params)
		return await super.get(url);
	}

	async getTickets() { 
		return await super.get('/me/orders');
	}

	async getMe() { 
		return await super.get('/me');
	}

	async updateUser(data) { 
		return await super.post('/me', data);
	}

	async updateEventSetting(setting_id, data) { 
		return await super.partialUpdate('/me/event_setting/' + setting_id, data);
	}
}