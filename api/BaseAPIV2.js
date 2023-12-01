
import MainUser from '../components/MainUser'
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseApiConfigProvider from '../managers/BaseApiConfigProvider'
import InternalConfig from '../constants/InternalConfig';
import Constants from 'expo-constants';

export default class BaseAPIV2 {
    
	constructor(url, auth) {
		this.auth = MainUser.getToken();
		console.log("INSTANCIATING BASEAPIV2 with auth = " + this.auth);
		this.app_type = "movement"
	}

	setAuth(auth) {
		console.log("Setting server auth")
		console.log(auth)
		this.auth = auth
	}

	setCommonHeaders(headers) { 
		// headers['mobile-app-version'] = Constants.manifest.version
		headers["internal-mobile-app-version"] = InternalConfig.internalSdk
		return headers
	}

	async handleErrors(response) {
		if (!response.ok) {
			try {
				const errorBody = await response.json()
				const failBody = { code: -1, error: errorBody }
				return failBody
			} catch (e) {
				return { code: -1, error: e }
			}
		}
		console.log("Successful response:")
		return response.json();
	}

	async get(endpoint) {
		var newUrl = this.url + endpoint
		var headers = {}
		console.log(endpoint)
		if (this.auth != null) {
			headers = {
				'Authorization': 'Token ' + this.auth, 
				'app-type': this.app_type
			}
		}
		try {
			const data = await fetch(BaseApiConfigProvider.getEnvUrl() + endpoint, {
				mode: 'cors',
				headers: this.setCommonHeaders(headers)
			})
				.then(res => this.handleErrors(res))
				.catch((error) => { return error })

			return data
		} catch {
			return undefined
		}
	}

	async post(endpoint, body) {
		console.log(endpoint)
		console.log(body)
		var auth = null
		if (this.auth != null) {
			auth = 'Token ' + this.auth
		}
		const data = await fetch(BaseApiConfigProvider.getEnvUrl() + endpoint, {
			method: 'POST',
			headers: this.setCommonHeaders({
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Authorization': auth,
				'app-type': this.app_type
			}),
			body: JSON.stringify(body)
		})
			.then((response) => { return this.handleErrors(response) })
			.catch((error) => { return { code: -1, error: error } })

		return data

	}

	async put(endpoint, body, callback, errorhandler) {
		var auth = null
		if (this.auth != null) {
			auth = 'Token ' + this.auth
		}
		const data = fetch(BaseApiConfigProvider.getEnvUrl() + endpoint, {
			method: 'PUT',
			headers: this.setCommonHeaders({
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Authorization': auth, 
				'app-type': this.app_type
			}),
			body: JSON.stringify(body)
		})
			.then((response) => { return this.handleErrors(response) })
			.catch((error) => { return { code: -1, error: error } })

		return data

	}

	async partialUpdate(endpoint, body) {
		console.log(endpoint)
		console.log(body)
		var auth = null
		if (this.auth != null) {
			auth = 'Token ' + this.auth
		}
		const data = await fetch(BaseApiConfigProvider.getEnvUrl() + endpoint, {
			method: 'PATCH',
			headers: this.setCommonHeaders({
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Authorization': auth, 
				'app-type': this.app_type
			}),
			body: JSON.stringify(body)
		})
			.then((response) => { return this.handleErrors(response) })
			.catch((error) => { return { code: -1, error: error } })

		return data
	}


	async uploadMedia(endpoint, data) {
		console.log(data)
		var auth = null
		if (this.auth != null) {
			auth = 'Token ' + this.auth
		}

		return await fetch(BaseApiConfigProvider.getEnvUrl() + endpoint, {
			method: 'post',
			headers: this.setCommonHeaders({
				'Authorization': auth,
				'app-type': this.app_type
			}),
			body: data
		}).then(res => { return this.handleErrors(res) })
			.catch((error) => { return { code: -1, error: error } })
	}

	async nonJsonPost(endpoint, body) {
		console.log(this.url)
		console.log(endpoint)
		var auth = null
		if (this.auth != null) {
			auth = 'Token ' + this.auth
		}
		return await fetch(BaseApiConfigProvider.getEnvUrl() + endpoint, {
			method: 'POST',
			headers: this.setCommonHeaders({
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': auth,
				'app-type': this.app_type
			}),
			body: body
		})
			.then((response) => { return this.handleErrors(response) })
			.catch((error) => { return { code: -1, error: error } })
	}
}
