import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Header,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";

import HomeMeals from "./HomeWidgets/HomeMeals";
import HomeBirthdays from "./HomeWidgets/Birthdays/HomeBirthdays";
import HomeCurrentMeal from "./Admin/HomeCurrentMeal";

import Container from "../../components/Container/Container";

import { useAtom } from "jotai";
import { authAtom } from "../../_helpers/Atoms";

export default function HomeScreen({ navigation, route }) {
  const [auth, setAuth] = useAtom(authAtom);
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
