import BaseAPIV2 from './BaseAPIV2';
import { combineParams } from '../managers/UtilsManager'

export default class CommentAPI extends BaseAPIV2 { 

	async createComment(comment, callback, errorhandler) { 
		return await super.post('/comment', comment, callback, errorhandler)
	}

	async getComments(eventId) { 
		return await super.get('/events/comments?event_id=' + eventId);
	}

	async getCommentsV2({eventId=null, chatId=null, page=null, expansions=null}) { 
		const params = []
		var url = "/comments"
		if (eventId !== null) { 
			params.push({
				title: 'event_id',
				value: eventId
			})
		}

		if (chatId !== null) { 
			params.push({
				title: 'chat_id',
				value: chatId
			})
		}

		if (page !== null) { 
			params.push({
				title: 'page',
				value: page
			})
		}
		if (expansions) { 
			params.push({
				title: 'expansions', 
				value: expansions
			})
		}

		url += combineParams(params)
		console.log(`Final url is: ${url}`)
		return await super.get(url);
	}

	async getChats(zone, expansions=null) { 
		const params = []
		var url = "/chat"
		if (zone !== null) { 
			params.push({
				title: 'zone',
				value: zone
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
}


