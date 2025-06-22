import { StyleSheet, View, Dimensions, ScrollView } from "react-native";

const screeenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

import { useEffect } from "react";

export default function Container({
  children,
  style,
  wide = false,
  maxHeight = true,
  state
}) {

  borderWidth = 5;

  switch (state) {
    case 0:
      stateColor = "green";
      break;
    case 1:
      stateColor = "lightblue";
      break;
    case 2:
      stateColor = "red";
      break;
    default:
      stateColor = "#ababab";
      borderWidth = 0;
  }

  useEffect(() => {
    console.log("state: ", state);
  }
  , [state]);

  const styles = StyleSheet.create({
    container: {
      //maxHeight: "93%",

      width: wide ? "100%" : screeenWidth > 500 ? "50%" : "95%",
      margin: "none",
      marginTop: screeenWidth > 500 ? 15 : 5,
      marginBottom: 5,
      backgroundColor: "white",
      borderRadius: 10,
      padding: screeenWidth > 500 ? 20 : 5,


      // Center elements
      alignSelf: "center",

      borderColor: stateColor,
      borderWidth,
      // Box shadow:
      shadowColor: "#ababab",
      shadowOffset: { width: 1, height: 3 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 5,
      flex: 1,
      ...style,
    },
  });

  return <ScrollView><View style={[styles.container, style]}>{children}</View></ScrollView>;
}
