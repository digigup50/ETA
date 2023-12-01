import * as Notifications from 'expo-notifications';
import { AnalyticsManager, events } from '../api/Analytics';
import Constants from 'expo-constants';

export async function registerForPushNotificationsAsync() {
	var token = null;
	console.log("IS DEVICE=====");
	console.log(Constants.isDevice);
	if (Constants.isDevice) {
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== 'granted') {
			console.log('Failed to get push token for push notification!');
			AnalyticsManager.logEvent(events.USER_DENIED_NOTIFICATION);
			return null;
		}
		
		token = (await Notifications.getExpoPushTokenAsync()).data;
		console.log(token);
	} else {
		alert('Must use physical device for Push Notifications');
	}

	if (Platform.OS === 'android') {
		Notifications.setNotificationChannelAsync('default', {
			name: 'default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: '#FF231F7C',
		});
	}
	return token;
};