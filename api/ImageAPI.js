import BaseAPIV2 from './BaseAPIV2';
export default class ImageAPI extends BaseAPIV2 {

	async uploadProfilePhoto(imageUri){ 
		const url = "/me/image";
		const data = new FormData();
		data.append('photo', {
			uri: imageUri,
			type: 'image/jpeg', // or photo.type
			name: 'pic.jpg'
		});
		return await this.uploadMedia(url, data);
	}
}