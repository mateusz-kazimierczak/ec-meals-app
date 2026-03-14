import Container from "../../components/Container/Container";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Icons from "@expo/vector-icons/Ionicons";

export default function Dashbaord({ navigation }) {
  const dashboardOptions = [
    {
      name: "Users",
      icon: "people-outline",
      action: () => navigation.navigate("Users"),
    },
    {
      name: "Meals",
      icon: "pizza-outline",
      action: () => navigation.navigate("AllMeals"),
    },
    {
      name: "Diets",
      icon: "leaf-outline",
      action: () => navigation.navigate("Diets"),
    },
    {
      name: "Logs",
      icon: "server-outline",
      action: () =>
        navigation.navigate("Logs", {
          returnPaths: ["Dashboard"],
        }),
    },
    {
      name: "Settings",
      icon: "settings-outline",
      action: () => navigation.navigate("Settings"),
    },
  ];

  return (
    <Container>
      <View style={styles.ScreensContainer}>
        {dashboardOptions.map((option) => (
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
});
