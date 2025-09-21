import React, { useState, useEffect } from 'react';
import { Text, View, Button, Platform, TextInput, StyleSheet } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
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
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export default function MobileNotificationRegister({ device, setDevice }) {
  const [registering, setRegistering] = useState(false);
  const [deviceName] = useState(Device.deviceName || "Unnamed Device");

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setDevice({ name: deviceName, token });
      }
    } catch (e) {
      // error already handled in helper
    }
    setRegistering(false);
  };

  return (
    <View style={styles.container}>
      {device && device.token && (
        <Text style={styles.deviceText}>
          Registered Device: <Text style={styles.deviceName}>{device.name}</Text>
        </Text>
      )}
      {Platform.OS === 'web' && (
        <Text style={styles.label}>
          Push notifications are not supported on web. Please use a physical device.
        </Text>
      )}
      {Platform.OS !== 'web' && (
        <>
        <Text style={styles.label}>Register this device for push notifications:</Text>
      <Button
        title={registering ? "Registering..." : device && device.token ? "Overwrite Registration" : "Register Device"}
        onPress={handleRegister}
        disabled={registering}
      />
        </>
      )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    width: 220,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  deviceText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  deviceName: {
    fontWeight: "bold",
    color: "#007AFF",
  },
})
