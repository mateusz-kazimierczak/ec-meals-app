import React, { useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Header,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from "react-native";

import HomeMeals from "./HomeWidgets/HomeMeals";
import HomeBirthdays from "./HomeWidgets/Birthdays/HomeBirthdays";
import HomeCurrentMeal from "./Admin/HomeCurrentMeal";

import Container from "../../components/Container/Container";

import { useAtom } from "jotai";
import { authAtom } from "../../_helpers/Atoms";
import { useFocusEffect } from '@react-navigation/native';
import { platformConfirm } from "../../_helpers/useAlert";
import { registerForPushNotificationsAsync } from "../../_helpers/pushNotifications";
import * as Device from 'expo-device';
import { set } from "react-hook-form";
import { platform } from "process";

import { useFetch } from "../../_helpers/useFetch";
import platformAlert from "../../_helpers/useAlert";

export default function HomeScreen({ navigation, route }) {
  const [auth, setAuth] = useAtom(authAtom);
  const hasPromptedForRegistration = useRef(false);
  const cFetch = useFetch();

  useFocusEffect(
    React.useCallback(() => {
      const promptForDeviceRegistration = async () => {
        // Only prompt once per app session, and only on physical devices
        if (
          !hasPromptedForRegistration.current && 
          Platform.OS !== 'web' && 
          Device.isDevice && 
          !auth.device_registered
        ) {
          hasPromptedForRegistration.current = true;
          
          const userWantsToRegister = await platformConfirm(
            "Enable Push Notifications",
            "Would you like to register this device for push notifications to receive meal alerts and updates?",
            {
              confirmText: "Yes",
              cancelText: "Not Now",
              destructive: false
            }
          );

          if (userWantsToRegister) {
            try {
              const token = await registerForPushNotificationsAsync(setAuth);
              if (token) {
                // Registration successful - auth atom already updated
                console.log('Device successfully registered for push notifications ', token);

                // Send token to db
                await cFetch.post(
                  `${process.env.EXPO_PUBLIC_BACKEND_API}/api/preferences/notifications/addDevice`,
                  {
                    device: { name: Device.deviceName || "Unnamed Device", token }
                  }
                );

                setAuth((prevAuth) => ({
                  ...prevAuth,
                  device_registered: true
                }));

                platformAlert("Registration Successful", "This device has been registered for push notifications.");
              }
            } catch (error) {
              console.error('Failed to register device:', error);
              // Error already handled by the registration function

              // send alert
              platformAlert("Registration Failed", "There was an issue registering for push notifications. Please try again later.");
            }
          }
        }
      };

      promptForDeviceRegistration();
    }, [auth.device_registered])
  );

  return (
    <ScrollView>
    {auth.role == "admin" && <HomeCurrentMeal navigation={navigation} route={route} />}
    <Container>
      <Text style={styles.headTitle}>Welcome to Ernescliff!</Text>
      <HomeMeals navigation={navigation} route={route} />
    </Container>
    <Container>
      <HomeBirthdays />
    </Container>
    
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  headTitle: {
    textAlign: "center",
    fontSize: 40,
    color: "#3b78a1",
    fontWeight: "600",
  },
  subtitle: {
    textAlign: "center",
    margin: 30,
    fontWeight: "400",
  },
  outerContainer: {
    flex: 1,
  }
});
