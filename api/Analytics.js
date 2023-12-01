import * as Amplitude from 'expo-analytics-amplitude';

const events = {
  APP_OPEN: 'APP_OPEN',
  USER_LOGGED_OUT: 'USER_LOGGED_OUT',
  USER_ONBOARD_START: 'USER_ONBOARD_START', 
  USER_ONBOARD_FINISH: 'USER_ONBOARD_FINISH',
  USER_CREATED_ACCOUNT: 'USER_CREATED_ACCOUNT',
  USER_VIEWED_PROFILE: 'USER_VIEWED_PROFILE',
  USER_UPDATED_USERNAME: 'USER_UPDATED_USERNAME',
  USER_UPLOADED_IMAGE: 'USER_UPLOADED_IMAGE',
  USER_VIEWED_EVENT_DETAIL: 'USER_VIEW_EVENT_DETAIL', 
  USER_COMMENTED_ON_EVENT: 'USER_COMMENTED_ON_EVENT',
  USER_COMMENTED: 'USER_COMMENTED',
  USER_JOINED_CHAT: 'USER_JOINED_CHAT',
  USER_MUTED_CHAT: 'USER_MUTED_CHAT',
  USER_OPENED_EVENT_LOCATION: 'USER_OPENED_EVENT_LOCATION',
  USER_CLICKED_TICKET: 'USER_CLICKED_TICKET',
  USER_DENIED_NOTIFICATION: 'USER_DENIED_NOTIFICATION',
  USER_WATCHED_VIDEO: 'USER_WATCHED_VIDEO',
  USER_CLICKED_LIVE_VIEW: 'USER_CLICKED_LIVE_VIEW',
  USER_SHARED_EVENT: 'USER_SHARED_EVENT',
  USER_CLICKED_CITY_PICKER: 'USER_CLIKCED_CITY_PICKER',
  USER_CLICKED_PLACE: 'USER_CLICKED_PLACE',
  USER_SHARED_APP: 'USER_SHARED_APP',
  USER_CLICKED_SIMILAR: 'USER_CLICKED_SIMILAR',
  USER_CLICKED_CHAT_TAB: 'USER_CLICKED_CHAT_TAB',
  USER_CLICK_MY_TICKETS_TAB: 'USER_CLICK_MY_TICKETS_TAB',
  USER_LOADED_MORE_EVENTS: 'USER_LOADED_MORE_EVENTS',
  USER_CLOSED_ANNOUNCEMENT: 'USER_CLOSED_ANNOUNCEMENT',
  USER_CLICKED_PROFILE: 'USER_CLICKED_PROFILE',
  USER_VIEWED_CELL_PROFILE: 'USER_VIEWED_CELL_PROFILE',
  USER_RATED_CURATION: 'USER_RATED_CURATION', 
  USER_VIEWED_SIGNUP: 'USER_VIEWED_SIGNUP', 
  USER_ENTERED_PHONE: 'USER_ENTERED_PHONE',
  CHAT_FAQ_SHOWN: 'CHAT_FAQ_SHOWN',
  USER_CLICKED_CURATOR_PROFILE: 'USER_CLICKED_CURATOR_PROFILE',
  ANNOUNCEMENT_CLICKED: 'ANNOUNCEMENT_CLICKED',
  USER_REENGAGED_NOTIFICATION: 'USER_REENGAGED_NOTIFICATION',
  SECTION_SEE_MORE_CLICK :'SECTION_SEE_MORE_CLICK',
  FILTER_CLICK: 'FILTER_CLICK',
  FILTER_APPLY: 'FILTER_APPLY',
  USER_VIEW_CALENDAR: 'USER_CLICKED_CALENDAR',
  USER_CLICK_SEE_MORE: 'USER_CLICK_SEE_MORE',
  USER_VIEW_HOME: 'USER_VIEW_HOME',
  USER_SOCIAL_LOGIN: 'USER_SOCIAL_LOGIN',
  USER_CHANGE_APP_THEME: 'USER_CHANGE_APP_THEME',
  TAG_CLICKED: 'TAG_CLICKED',
  USER_START_CHAT_PROFILE: 'USER_START_CHAT_PROFILE',
  USER_SHOWN_NOT_LIVE_POPUP: 'USER_SHOWN_NOT_LIVE_POPUP',
  USER_VIEW_SUBMIT_PAGE: 'USER_VIEW_SUBMIT_PAGE'
};


const baseProperties = {
	"appDomain": "movement"
}
class Analytics {  
	
	constructor() { 
		if (!Analytics.instance) { 
			this.state = { 
				initialized: false
			}
			Analytics.instance = this
		}

		return Analytics.instance
	}

	async initialize() { 
		if (__DEV__) { 
			return 
		}

		const API_KEY = 'e7f4062ed3c9239f51e28798c708d624'
		await Amplitude.initializeAsync(API_KEY);

		this.state.initialized = true
	}

	async maybeInitialize() { 
		if (!this.state.initialized) { 
			await this.initialize();
		}
	}

	async logEvent(event, properties=null) { 

			if (__DEV__) { 
				console.log("DEV, RETUNING")
				return 
			}

			console.log("NOT DEV, CONTINUING..")
			
			this.maybeInitialize();

			if (properties) { 
				for (var key of Object.keys(baseProperties)) { 
					properties[key] = baseProperties[key];
				}
				Amplitude.logEventWithPropertiesAsync(event, properties)
			} else { 
				Amplitude.logEventWithPropertiesAsync(event, baseProperties);
			}
	}
	

	async setUserId(id) { 
		if (__DEV__) { 
			return;
		}
		if (id === null || id === undefined) { 
			return 
		}
		await this.maybeInitialize();
		await Amplitude.setUserIdAsync(id)
	}

	async setUserProperties(properties) { 
		if (__DEV__) { 
			return;
		}
		if (properties !== null && properties !== undefined){
			await this.maybeInitialize();
			await Amplitude.setUserPropertiesAsync(properties)
		}
	}

}

const AnalyticsManager = new Analytics();

export {AnalyticsManager, events}