import React, { useState, useEffect } from 'react';
import { Text, View, Button, Platform, TextInput, StyleSheet } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, sendTestNotification } from '../../../_helpers/pushNotifications';
import { useAtom } from 'jotai';
import { authAtom } from '../../../_helpers/Atoms';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function MobileNotificationRegister({ device, setDevice }) {
  const [registering, setRegistering] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [deviceName] = useState(Device.deviceName || "Unnamed Device");
  const [auth, setAuth] = useAtom(authAtom);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const token = await registerForPushNotificationsAsync(setAuth);
      if (token) {
        setDevice({ name: deviceName, token });
      }
    } catch (e) {
      // error already handled in helper
    }
    setRegistering(false);
  };

  const handleTestNotification = async () => {
    setTestingNotification(true);
    try {
      const success = await sendTestNotification();
      if (success) {
        alert('Test notification sent! Check your notifications in a moment.');
      }
    } catch (e) {
      // error already handled in helper
    }
    setTestingNotification(false);
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
      {device && device.token && (
        <View style={styles.testSection}>
          <Text style={styles.testLabel}>Test your notifications:</Text>
          <Button
            title={testingNotification ? "Sending Test..." : "Send Test Notification"}
            onPress={handleTestNotification}
            disabled={testingNotification}
            color="#28a745"
          />
        </View>
      )}
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
  testSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  testLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
    fontStyle: 'italic',
  },
})
