import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import UserAPI from '../api/UserAPI';



class MainUser { 
	constructor() { 
		if (!MainUser.instance) { 
			this.state = { 
				token: null,
				user: null
			}
			this.userApi = null;
			MainUser.instance = this;
		}
		return MainUser.instance
	}

	getUserApi = () => { 
		if (!this.userApi) { 
			this.userApi = new UserAPI();
			return this.userApi;
		} else { 
			return this.userApi;
		}
	}

	loadTokenFromMemory(callback) { 
		AsyncStorage.getItem('token')
		.then((value) => {
			console.log('value', value)
			this.state.token = value
			callback(value)
		})
	}

	async getNotLiveShownDate() { 
		const value = await AsyncStorage.getItem("notLiveShownDate")
		return value;
	}

async setNotLiveShownDate() { 
		await AsyncStorage.setItem("notLiveShownDate", Date().toString());
	}

	setToken(token) {
		console.log("SETTING MAIN USER TOKEN TO BE");
		console.log(token);
		this.state.token = token;
		console.log(this.state.token);
	}

	getToken(){
		console.log("GRABBING TOKEN FROM MAIN USER");
		console.log(this.state.token);
		return this.state.token
	}
	
	// THIS IS BAD. RETURNS ERROR RESP.
	// CONSTANTLY CREATES NEW USER API EACH TIME...
	// WTF FIX THIS.
	async loadUserFromApiAsync() { 
		console.log("MY AUTH IS");
		console.log(this.getUserApi().auth);
		const meResp = await this.getUserApi().getMe();
		if (meResp && meResp.code !== -1) {
			this.state.user = meResp;
		}
		console.log('meResp', meResp)
		return meResp
	}

	clearInstanceToken() { 
		console.log("CLEARING INSTANCE TOKEN");
		this.state.token = null;
	}

	loadUserFromData(data){ 
		this.state.user = data
	}

	getUserId(){
		return this.state.user.id
	}

	getMyEventChats(version = null, callback, errorcallback) { 
		this.getUserApi().getUserEventsChats(version, callback, errorcallback)
	}

	// Deprecated. Use react store not this for user state.
	getUser() { 
		return this.state.user
	}

	async updateMe(email, username) { 
		var data = {}
		if (email != null) { 
			data.email = email
		}

		if (username != null) { 
			data.username = username
		}
		return await this.getUserApi().updateUser(data);
	}

	async blockUser(userId) { 
		const userIds = this.state.user.block_list.map((item) => item.id);
		userIds.push(userId);
		const result = await this.getUserApi().partialUpdate(this.state.user.id, {block_list: userIds});
		if (result && result.code !== -1) { 
			this.loadUserFromData(result);
			return result;
		} else { 
			Alert.alert("Failed to block user. Please try again later");
			return null;
		}		
	}

	getBlockList(){
		const blockList = this.state.user.block_list ? this.state.user.block_list : []
		return blockList;
	}

	getZoneSlug(user) { 
		const zone = this.getZone(user)
		if (zone !== null) { 
			return zone.slug
		} else { 
			return null
		}
	}

	getZone(user) { 
		if (user === null || user === undefined) { 
			return null
		} else{
			const zone = user.zone
			if (zone !== null && zone !== undefined) { 
				return zone
			} else { 
				return null
			}
		}
	}

	isPromoter() { 
		if (this.state.user == null || this.state.user == undefined) { 
			return false
		}
		
		var promoterAccount = false
		var accessAccount = false
		if (this.state.user.promoter_set !== undefined && this.state.user.promoter_set !== null) { 
			promoterAccount = this.state.user.promoter_set.length !== 0
		}

		if (this.state.user.accountaccess_set !== undefined && this.state.user.accountaccess_set !== null) { 
			accessAccount = this.state.user.accountaccess_set.length !== 0
		}

		return promoterAccount || accessAccount
	}

}

const instance = new MainUser()

export default instance;
