
export default class ErrorManager {

	constructor(){}

	getErrorString(error) {
		console.log("error manager looking at")
		console.log(error)
		if (error === null || error === undefined) { 
			console.log("Error is null or undefined. Returning")
			return "Sorry, something went wrong. We're looking into it. Try again later."
		}

		if (error.detail !== undefined) { 
			console.log("Error has a detail!")
			return error.detail
		} else { 
			try { 
				console.log("Error has no detail")
				const fieldName = Object.keys(error)[0]
				const errorMessage = error[fieldName][0]
				return `${fieldName}: ${errorMessage}`
			} 
			catch (e) { 
				console.log("Everything failed. idk.")
				return "Sorry, something went wrong. We're looking into it. Try again later."
			}
		} 
	}

}