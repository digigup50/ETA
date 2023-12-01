import MainUser from '../components/MainUser'
import AsyncStorage from '@react-native-async-storage/async-storage';
const prod = 'https://gameplanapp.herokuapp.com/api'
const stage = 'https://gameplanstageapp.herokuapp.com/api'
const local = 'http://192.168.1.4:8000/api'

//DO NOT CHANGE THIS. ALL USERS WILL BE LOGGED OUT.
var apiUrl = stage

function handleErrors(response) {
    if (!response.ok) {
    	const errorBody = response.json()
    	console.log("SOMETHING WENT WRONG")
    	return errorBody.then(Promise.reject.bind(Promise))
    }
    console.log("RESPONSE IS OKAY")
    return response.json();
}

function get(endpoint, callback, errorcallback, fullUrl) { 
	console.log(endpoint)
	var newUrl = apiUrl + endpoint
	if (fullUrl !== undefined) { 
		newUrl = fullUrl
	}
	fetch(newUrl, {
		headers : {
			'Authorization': 'Token ' + MainUser.getToken()
		}
	})
		.then((res) => { return handleErrors(res)})
		.then((json) => callback(json))
		.catch((error) => errorcallback(error))
}

function post(endpoint, body, callback, errorhandler) { 
	console.log(endpoint)
	console.log(body)
	console.log(MainUser.getToken())
	fetch(apiUrl + endpoint, { 
		method: 'POST', 
		headers: { 
			Accept: 'application/json', 
			'Content-Type': 'application/json',
			'Authorization': 'Token ' + MainUser.getToken()
		}, 
		body: JSON.stringify(body)
	})
	.then((response) => {return handleErrors(response)})
	 .then((json) => callback(json))
	 .catch((error) => errorhandler(error))
}

function put(endpoint, body, callback, errorhandler) { 
	fetch(apiUrl + endpoint, { 
		method: 'PUT', 
		headers: { 
			Accept: 'application/json', 
			'Content-Type': 'application/json',
			'Authorization': 'Token ' + MainUser.getToken()
		}, 
		body: JSON.stringify(body)
	})
	.then((response) => {return handleErrors(response)})
	 .then((json) => callback(json))
	 .catch((error) => errorhandler(error))
}

function patch(endpoint, body, callback, errorhandler) { 
	fetch(apiUrl + endpoint, { 
		method: 'PATCH', 
		headers: { 
			Accept: 'application/json', 
			'Content-Type': 'application/json',
			'Authorization': 'Token ' + MainUser.getToken()
		}, 
		body: JSON.stringify(body)
	})
	.then((response) => {return handleErrors(response)})
	 .then((json) => callback(json))
	 .catch((error) => errorhandler(error))
}

function nonJsonPost(endpoint, body, callback, errorhandler) { 
	fetch(apiUrl + endpoint, { 
			method: 'POST',
			headers : { 
				'Content-Type': 'application/x-www-form-urlencoded'
			},  
			body: body
		})
		.then((response) => {return handleErrors(response)})
		 .then((json) => callback(json))
		 .catch((error) => errorhandler(error))
}


function nonTokenpost(endpoint, body, callback, errorhandler) { 
	console.log(endpoint)
	console.log(body)
	fetch(apiUrl + endpoint, { 
		method: 'POST', 
		headers: { 
			Accept: 'application/json', 
			'Content-Type': 'application/json',
		}, 
		body: JSON.stringify(body)
	})
	.then((response) => {return handleErrors(response)})
	 .then((json) => callback(json))
	 .catch((error) => errorhandler(error))
}

//TODO: Add error catching.
function uploadImage(endpoint, imageUri, callback){ 
	const data = new FormData();
	data.append('photo', {
	  uri: imageUri,
	  type: 'image/jpeg', // or photo.type
	  name: 'pic.jpg'
	});

	fetch(apiUrl + endpoint, {
	  method: 'post',
	  headers: { 
			'Authorization': 'Token ' + MainUser.getToken()
		}, 
	  body: data
	}).then(res => {
	  console.log(res)
	  callback(res)
	});
}

function changeEnv(env) { 
	var url = ''
	if (env == 'STAGE') { 
		url = stage
	} else if (env == 'PROD') { 
		url = prod
	} else { 
		url = local
	}
	apiUrl = url
	AsyncStorage.setItem('envUrl', url)

}

async function loadUserEnvPreference() { 
	AsyncStorage.getItem('envUrl')
		.then((value) => {
			console.log(value)
			if (value != null) { 
				apiUrl = value
			}
		})
}




export { get, post, put, patch, nonJsonPost, nonTokenpost, uploadImage, changeEnv, loadUserEnvPreference, apiUrl }