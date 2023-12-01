import {get, post} from './BaseAPI';
import { combineParamsV2 } from '../managers/UtilsManager'
import BaseAPIV2 from './BaseAPIV2'

export default class EventAPI extends BaseAPIV2 { 

 likeEvent() { 

 }

 async getEvent(eventId, expansions, callback, errorhandler) {
 	const eventUrl = '/events/' + eventId  + `?expansions=${expansions}`
 	return await super.get(eventUrl);
 }

 async getUpcomingEvents({zone=null, category=null, limit=null, offset=null, start=null, end=null, rank=null, exclude_ids=null,
 								orderBy=null, search=null, expansions=null } = {}, callback, errorhandler) { 
 	var url = "/upcoming_events"
 	const params = []
 	if (zone !== undefined && zone !== null) {
 		params.push({
 			zone: zone
 		})
 	}


 	if (category !== null) { 
 		params.push({
 			category: category.toString()
 		})
 	}

 	if (limit !== null) { 
 		params.push({
 			limit: limit
 		})
 	}

 	if (offset !== null) { 
 		params.push({
 			offset: offset
 		})
 	}

 	if (start !== null) { 
 		params.push({
 			start: start
 		})
 	}

 	if (end !== null) { 
 		params.push({
 			end: end
 		})
 	}

 	if (rank !== null) { 
 		params.push({
 			min_rank: rank
 		})
 	}

 	if (exclude_ids !== null) { 
 		params.push({
 			exclude_ids: exclude_ids	
 		})
 	}

 	if (orderBy !== null) { 
 		params.push({
 			order_by: orderBy
 		})
 	}

	 if (search !== null) { 
		params.push({
			search: search
		})
	}

	if (expansions) { 
		params.push({expansions: expansions});
	}

 	url += combineParamsV2(params)

 	return await super.get(url);
 }

 async getFeaturedEvents(zone, callback, errorhandler) { 
 	var url = '/upcoming_featured'
 	if (zone !== null && zone !== undefined) { 
 		url += '/' + zone
 	}
 	return await super.get(url);
 }

 async getOrganizerEvents(callback, errorhandler){ 
	return await super.get('/organizer/my_events');
 }

 async getOrganizerEvent(eventId, callback, errorhandler) { 
 	return await super.get('/organizer/event/' + eventId.toString());
 }

 async logEventView(eventId, aff) { 
 	const body = { 
 		event_id: eventId,
 		label: 'event_view',
 		source: aff,
 		params: JSON.stringify({ source: aff})
 	}
 	return await super.post('/analytics', body);
 }

}

