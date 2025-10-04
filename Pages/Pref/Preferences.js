import { StyleSheet, View, Text, TouchableOpacity, Platform } from "react-native";
import Container from "../../components/Container/Container";

// Conditionally import Linking for non-web platforms with error handling
let Linking;
try {
  if (Platform.OS !== 'web') {
    Linking = require("expo-linking");
  }
} catch (error) {
  console.warn("Failed to load expo-linking:", error);
  Linking = null;
}

import { useAtom } from "jotai";
import { authAtom } from "../../_helpers/Atoms";
import Icons from "@expo/vector-icons/Ionicons";

export default function Preferences({ navigation, route }) {
  const [auth, setAuth] = useAtom(authAtom);

  const handleLinkPress = (url) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else if (Linking) {
      Linking.openURL(url);
    }
  };

  const preferencesOptions = [
    {
      name: "General Preferences",
      icon: "settings-outline",
      action: () =>
        navigation.navigate("General Preferences", {
          returnPaths: ["Preferences Dashboard"],
          forUser: auth.user_id,
        }),
    },
    {
      name: "Notification Preferences",
      icon: "notifications-outline",
      action: () =>
        navigation.navigate("Notification Preferences", {
          returnPaths: ["Preferences Dashboard"],
        }),
    },
    {
      name: "Logs",
      icon: "server-outline",
      action: () =>
        navigation.navigate("Logs", {
          user_id: true,
          returnPaths: ["Preferences Dashboard"],
        }),
    },
    {
      name: "Edit Account",
      icon: "create-outline",
      action: () =>
        navigation.navigate("Edit Account", {
          returnPaths: ["Preferences Dashboard"],
          token: auth.token,
        }),
    },
    {
      name: "Log Out",
      icon: "log-out-outline",
      action: () => {
        setAuth({});
        navigation.navigate("Home");
      },
    },
  ];

  return (
    <Container>
      <View style={styles.preferencesContainer}>
        {preferencesOptions.map((option) => (
          <TouchableOpacity
            key={option.name}
            style={styles.linkContainer}
            onPress={option.action}
          >
            <Icons name={option.icon} size={24} color={"#3b78a1"} style={styles.icon} />
            <Text style={styles.linkText}>{option.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.bottomInfoContainer}>
        <Text style={styles.bottomText}>
          App by{" "}
          <Text
            onPress={() => handleLinkPress(process.env.EXPO_PUBLIC_DEV_URL)}
            style={styles.link}
          >
            Mateusz Kazimierczak
          </Text>
        </Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  preferencesContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  icon: {
    marginRight: 10,
  },
  linkText: {
    fontSize: 18,
    color: "#007AFF",
    textDecorationLine: "none",
  },
  bottomInfoContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  bottomText: {
    fontSize: 14,
    color: "#333",
  },
  link: {
    textDecorationLine: "underline",
    color: "#007AFF",
  },
});
