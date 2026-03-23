// Import polyfills FIRST
import './polyfills';
import "react-native-gesture-handler";

import React, { Suspense, useState } from 'react';

import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

import HeaderLogo from "./components/header/header";

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
import OfflineGate from "./components/OfflineGate";
import { ConnectivityProvider, useConnectivity } from "./_helpers/connectivity";

export default function App() {
  return (
    <SafeAreaProvider>
      <ConnectivityProvider>
        <Suspense fallback={<Text>Loading...</Text>} >
          <AppEntry />
        </Suspense>
      </ConnectivityProvider>
    </SafeAreaProvider>
  );
}

function AppEntry () {
  const [auth] = useAtom(authAtom);
  const { isConnected, isConnectionKnown, refreshConnection } = useConnectivity();
  const [isRefreshingConnection, setIsRefreshingConnection] = useState(false);

  const handleRetryConnection = async () => {
    setIsRefreshingConnection(true);
    await refreshConnection();
    setIsRefreshingConnection(false);
  };

  if (!isConnectionKnown || !isConnected) {
    return (
      <View style={styles.container}>
        <ToastManager />
        <OfflineGate
          isConnectionKnown={isConnectionKnown}
          isRefreshing={isRefreshingConnection}
          onRetry={handleRetryConnection}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ToastManager />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            cardStyle: { flex: 1 },
            tabBarIcon: ({ color, size }) => {
              return (
                <Icons
                  name={iconTitle(route.name)}
                  size={size}
                  color={color}
                />
              );
            },
            tabBarStyle: {
              paddingBottom: 0,
              backgroundColor: '#fff',
            },
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#3b78a1',
          })}
        >
          {navTabs(auth?.role).map((tab) => (
            <Tab.Screen
              name={tab.name}
              key={tab.name}
              component={tab.component}
              options={() => ({
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
