import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import * as Linking from "expo-linking";
import Container from "../../components/Container/Container";

import { useAtom } from "jotai";
import { authAtom } from "../../_helpers/Atoms";
import Icons from "@expo/vector-icons/Ionicons";

export default function Preferences({ navigation, route }) {
  const [auth, setAuth] = useAtom(authAtom);

  const preferencesOptions = [
    {
      name: "Log Out",
      icon: "log-out-outline",
      action: () => {
        setAuth({});
        navigation.navigate("Home");
      },
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
      name: "General Preferences",
      icon: "settings-outline",
      action: () =>
        navigation.navigate("General Preferences", {
          returnPaths: ["Preferences Dashboard"],
          forUser: auth.user_id,
        }),
    }
  ];

  return (
    <Container>
      <View style={styles.ScreensContainer}>
        {preferencesOptions.map((option) => (
          <TouchableOpacity
            key={option.name}
            style={styles.SingleScreenContainer}
            onPress={option.action}
          >
            <Icons name={option.icon} size={50} color={"#3b78a1"} />
            <Text style={styles.ScreenTextContainer}>{option.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.bottomInfoContainerOuter}>
        <View style={styles.bottomInfoContainerInner}>
          <Text>App by </Text>
          <Text
            onPress={() => Linking.openURL(process.env.EXPO_PUBLIC_DEV_URL)}
            style={{ textDecorationLine: "underline", color: "#007AFF" }}
          >
            Mateusz Kazimierczak
          </Text>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  ScreensContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flexWrap: "wrap",
    margin: 20,
  },
  SingleScreenContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    padding: 20,
    borderWidth: 2,
    borderRadius: 15,
    borderColor: "#3b78a1",
    backgroundColor: "#f9f9f9",
  },
  ScreenTextContainer: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    color: "#333",
  },
  bottomInfoContainerOuter: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignContent: "flex-end",
    marginTop: 20,
  },
  bottomInfoContainerInner: {
    flexDirection: "row",
  },
});
