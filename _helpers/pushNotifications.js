import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

async function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

export async function registerForPushNotificationsAsync(updateAuthAtom) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alerts', {
      name: 'Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'bell.wav'
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      
      // Update auth atom to set device_registered to true on successful registration
      if (updateAuthAtom && pushTokenString) {
        updateAuthAtom((prevAuth) => ({
          ...prevAuth,
          device_registered: true
        }));
      }
      
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export async function sendTestNotification() {
  try {
    // Check if we have permission first
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      alert('Notifications permission not granted. Please register device first.');
      return false;
    }

    // Schedule a local notification for testing
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Test Notification",
        body: "This is a test notification from EC Meals app!",
        data: { test: true },
        sound: 'bell.wav',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        repeats: false,
      },
    });

    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    alert('Failed to send test notification: ' + error.message);
    return false;
  }
}

export { handleRegistrationError };
