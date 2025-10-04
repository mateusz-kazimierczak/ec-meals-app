// Import polyfills FIRST
import './polyfills';
import "react-native-gesture-handler";

import React, { Suspense } from 'react';

import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, KeyboardAvoidingView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

import HeaderLogo from "./components/header/header";
import DeskNav from "./components/header/HeaderNav/Desk/deskNav";

import HomeNoAuth from "./Pages/Home/HomeNoAuth";
import HomeUser from "./Pages/Home/HomeUser";
import Login from "./Pages/Auth/LogIn";
import Admin from "./Pages/Admin/AdminRouter";
import PreferencesRouter from "./Pages/Pref/PreferencesRouter";
import Meals from "./Pages/Meals/Meals";

import { useAtom } from "jotai";
import { authAtom } from "./_helpers/Atoms";

import Icons from "@expo/vector-icons/Ionicons";
import ToastManager from "toastify-react-native";

export default function App() {
  return (
    <SafeAreaProvider>
      <Suspense fallback={<Text>Loading...</Text>} >
        <AppEntry />
      </Suspense>
    </SafeAreaProvider>
  );
}

function AppEntry () {
  const [auth, setAuth] = useAtom(authAtom);
  return (
    <View style={styles.container}>
          <ToastManager />
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                cardStyle: { flex: 1 },
                tabBarIcon: ({ focused, color, size }) => {
                  return (
                    <Icons
                      name={iconTitle(route.name)}
                      size={size}
                      color={color}
                    />
                  );
                },
                // Add proper safe area handling
                tabBarStyle: {
                  paddingBottom: 0, // Remove extra padding
                  backgroundColor: '#fff',
                },
                headerStyle: {
                  backgroundColor: '#fff', // White header background to match tabs
                },
                headerTintColor: '#3b78a1', // Blue text on white background
              })}
            >
            {navTabs(auth?.role).map((tab) => (
              <Tab.Screen
                name={tab.name}
                key={tab.name}
                component={tab.component}
                options={({ route, navigation }) => ({
                  headerRight: () => <HeaderLogo />,
                  headerTitleAlign: "left",
                })}
              />
            ))}
          </Tab.Navigator>
        </NavigationContainer>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  main: {},
});

const navTabs = (role) => {
  switch (role) {
    case "student":
      return [
        { name: "Home", component: HomeUser },
        { name: "Meals", component: Meals },
        { name: "Preferences", component: PreferencesRouter },
      ];
    case "admin":
      return [
        { name: "Home", component: HomeUser },
        { name: "Meals", component: Meals },
        { name: "Admin", component: Admin },
        { name: "Preferences", component: PreferencesRouter },
      ];
    default:
      return [
        { name: "Home", component: HomeNoAuth },
        { name: "Log In", component: Login },
      ];
  }
};

const iconTitle = (name) => {
  switch (name) {
    case "Home":
      return "home-outline";
    case "Log In":
      return "log-in-outline";
    case "Preferences":
      return "settings-outline";
    case "Admin":
      return "apps-outline";
    case "Meals":
      return "pizza-outline";
    default:
      return "Home";
  }
};
