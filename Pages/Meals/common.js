
import {
    Dimensions,
  } from "react-native";

export const screeenWidth = Dimensions.get("window").width;

export const screenHeight = Dimensions.get("window").height;


export const DaysOfTheWeek = [
  "Meals",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const MealTypes =
  screeenWidth > 500
    ? ["Breakfast", "Lunch", "Supper", "P1", "P2", "PS", "No Meals"]
    : ["B", "L", "S", "P1", "P2", "PS", "X"];

    