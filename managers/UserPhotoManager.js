

function getPhoto(photo) { 
  	if (photo != null) { 
  		return photo.image
  	} else { 
  		return null
  	}
}

function getETAPhoto(photo) { 
	if (photo === null || photo === undefined) { 
		return require("../assets/images/eta_green.png")
	} else {
		return {uri: photo}
	}
}

function getPersonPhoto(photo) { 
	if (photo === null || photo === undefined) { 
		return require("../assets/images/person.png")
	} else {
		return photo
	}
}

export { getPhoto, getETAPhoto }