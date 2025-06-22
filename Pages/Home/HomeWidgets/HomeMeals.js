import { View, Text, Button, StyleSheet, Dimensions } from "react-native";
import Loader from "../../../components/Loader/Loader";
import { useEffect, useState } from "react";
import { useFetch } from "../../../_helpers/useFetch";

const screeenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;



import { useFocusEffect } from "@react-navigation/native";

import React from "react";

export default function HomeMeals({ navigation, route }) {
  const cFetch = useFetch();
  const [loading, setLoading] = useState(false);
  const [mealsToday, setMealsToday] = useState(null);
  const [mealsTomorrow, setMealsTomorrow] = useState(null);
  


  useFocusEffect(
    React.useCallback(() => {
      console.log(
        "API: ",
        process.env.EXPO_PUBLIC_BACKEND_API,
        " welcome test"
      );
      fetchMeals();
    }, [])
  );

  const fetchMeals = async () => {
    setLoading(true);
    const res = await cFetch
      .get(`${process.env.EXPO_PUBLIC_BACKEND_API}/api/home/meals`)
      .catch((err) =>
        console.log("Error while fetching data from server: ", err)
      );

    setMealsToday(res.allMealsToday);
    setMealsTomorrow(res.tomorrowMeals);
    setLoading(false);

    console.log("Meals today: ", typeof res.allMealsToday, res.allMealsToday);
    console.log("Meals tomorrow: ", typeof res.tomorrowMeals, res.tomorrowMeals);
  };

  return (
    <View style={styles.outerContainer}>
      <Loader loading={loading}>
        <View style={styles.myMealsContainer}>
          <View>
            <Text style={styles.headerText}>Meals today</Text>
            {Array.isArray(mealsToday) &&
              mealsToday?.map(
                (meal, index) =>
                  meal && (
                    <Text style={styles.singleMeal} key={index}>
                      {MealCategories[index]}
                    </Text>
                  )
              )}
          </View>
          <View>
            <Text style={styles.headerText}>Meals tomorrow</Text>
            {Array.isArray(mealsTomorrow) &&
              mealsTomorrow?.map(
                (meal, index) =>
                  meal && (
                    <Text style={styles.singleMeal} key={index}>
                      {MealCategories[index]}
                    </Text>
                  )
              )}
          </View>
        </View>
      </Loader>
      <View >
        <Button title="Mark meals" onPress={() => navigation.navigate("Meals")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  myMealsContainer: {
    flexDirection: "row",
    justifyContent: screeenWidth > 500 ? "space-around" : "space-between",
  },
  headerText: {
    fontSize: screeenWidth > 500 ? 25 : 20,
    fontWeight: "600",
    backgroundColor: "#3b78a1",
    color: "white",
    padding: screeenWidth > 500 ? 10 : 3,
    margin: screeenWidth > 500 ? 0 : 5,
    borderRadius: 10,
  },
  singleMeal: {
    width: "100%",
    textAlign: "center",
    fontSize: 20,
    padding: 10,
  },
  outerContainer: {
    padding: 30,
    flex: 1,
    justifyContent: "center",
  },
});

const MealCategories = [
  "Breakfast",
  "Lunch",
  "Supper",
  "P1",
  "P2",
  "PS",
  "No Meals",
  "Unmarked",
];
