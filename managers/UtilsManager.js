import CommentAPI from "../api/CommentAPI"
import MainUser from '../components/MainUser'
import { Alert } from 'react-native';

const commentAPI = new CommentAPI()

function getTicketCountMap(tickets) { 
		let map = {}
		for (const ticket of tickets) { 
				if (!map[ticket.ticket_group.title]) { 
					map[ticket.ticket_group.title] = 1
				} else {
					map[ticket.ticket_group.title] += 1
				}
		}
		return map
}

function combineParams(params) { 
		if (params === null || params.length === 0) { 
			return ""
		}
		console.log(`Looking at params`)
		console.log(params)
		var paramStr = "?"
		for (let number = 0; number < params.length; number++) { 
			const param = params[number]
			paramStr += param.title + "=" + param.value 
			if (number < params.length - 1) { 
				paramStr += "&"
			}
		}

		return paramStr
	}


function getParamValues(value) {
		// Polyfill
		if (typeof Array.isArray === 'undefined') {
	  		Array.isArray = function(obj) {
	    		return Object.prototype.toString.call(obj) === '[object Array]';
	  		}
		}
		
		if (Array.isArray(value)) { 
			return value.join()
		} else { 
			return value
		}
}

function combineParamsV2(params) { 
	if (params === null || params.length === 0) { 
			return ""
		}

		var paramStr = "?"
		for (let number = 0; number < params.length; number++) { 
			const param = params[number]
			for (var key in param) {
				paramStr += key + "=" + getParamValues(param[key])
			}
			if (number < params.length - 1) { 
				paramStr += "&"
			}
		}

		return paramStr
}

function getZoneSlug(user) { 
	slug = null
	if (user === null) { 
		return null
	}
	if (user.zone !== null && user.zone !== undefined) { 
		slug = user.zone.slug
	}
	return slug
}

function getTimeZone(item) { 
	const zone = getZone(item)
	if (zone !== null) { 
		return zone.time_zone
	} else {
		return null
	}
}

function getZone(item) { 
	zone = null
	if (!item) { 
		return null
	}
	if (item.zone !== null && item.zone !== undefined) { 
		zone = item.zone
	}
	return zone 
}


function getConfig(zone) {
	if (!zone) { 
		return null;
	}
	
	const config = zone.config
	if (config === null || config === undefined) {
		return null
	}

	var context = config

	try { 
		for (var i = 1; i < arguments.length; i ++) { 
			arg = arguments[i]
			context = context[arg]
		}

	} catch(error) { 
		return null
	}

	return context
}

function getUserPicture(user, fallbackPersonUrl=false) {
	var fallbackPersonUrl = null
	if (fallbackPersonUrl) { 
		fallbackPersonUrl = "https://gameplan-image-urls.s3.us-east-2.amazonaws.com/person.png";
	}
	if (!user) { 
		return fallbackPersonUrl;
	}
	if (user.profile_image) { 
		if (user.profile_image.image) { 
			return user.profile_image.image
		}
	} 
	if (user.image_url) { 
		return user.image_url
	}

	return fallbackPersonUrl;
}

async function createStartDM(user) { 
	commentAPI.setAuth(MainUser.getToken())
	const result = await commentAPI.createComment({to_individual_id: user.id, creator: MainUser.getUserId(), value: "New Direct Message Chat started" });
	if (result && result.code !== -1) { 
		return result;
	} else { 
		return null;
	}
}

async function handleDMClick(user) { 
    return await new Promise((res, rej) => Alert.alert(
			 'Start a new chat',
			 'They will be notified of your chat request if you continue ',
			  [
			    { text: 'OK', onPress: async() => { 
					const result = await createStartDM(user);
					res({type: 'result', data: result});
				 }},
          		{ text: 'Cancel', onPress: () => res({type: 'cancel', data: null}) }
			  ],
			  { cancelable: true })
			  )
  }

  function getMinimumDate() { 
	  return new Date(-8640000000000000);
  }


export { getTicketCountMap, getUserPicture, combineParams, getZoneSlug, getZone, getTimeZone, combineParamsV2, getConfig, createStartDM, handleDMClick, getMinimumDate }