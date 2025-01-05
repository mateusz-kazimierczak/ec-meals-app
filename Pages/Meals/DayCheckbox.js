import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    Button,
    ScrollView,
  } from "react-native";

import Checkbox from "expo-checkbox";

import { useAtom } from "jotai";
import { authAtom } from "../../_helpers/Atoms";

import { MealTypes, DaysOfTheWeek, screeenWidth } from "./common";


export default function DayCheckbox({
    data,
    setData,
    indexDay,
    indexType,
    setUpdateState,
    disabledDay,
  }) {
    let isDisabled;
    if (indexType < 3 || indexType == MealTypes.length - 1) {
      isDisabled = indexDay == disabledDay;
    }
    if (indexType >= 3 && !isDisabled) {
      isDisabled = indexDay == (disabledDay + 1) % 7;
    }
    
    const [auth, setAuth] = useAtom(authAtom);
    const toggleValue = () => {
      console.log("Auth: ", auth);
      setUpdateState(false);
      setData((prev) => {
        const newData = [...prev];
  
        if (indexType == MealTypes.length - 1) {
          // If No meals is selected, unselect everything else
          newData[indexDay] = newData[indexDay].map(() => false);
          newData[indexDay][indexType] = true;
          return newData;
        } else {
          // Otherwise just toggle the value
          newData[indexDay][indexType] = !newData[indexDay][indexType];
          newData[indexDay][MealTypes.length - 1] = false;
          return newData;
        }
      });
    };
  
    getBackgroundColor = () => {
      if (isDisabled) {
        return "red";
      } else if (indexType == MealTypes.length - 1) {
        return "#ffd063";
      } else {
        return undefined;
      }
    };
    return (
      <View
        style={{
          flex: 1,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 5,
          backgroundColor: getBackgroundColor(),
        }}
      >
        <Checkbox
          style={
            screeenWidth > 500 ? styles.checkboxDesktop : styles.checkboxMobile
          }
          disabled={isDisabled && !auth?.preferences?.allowNextWeek}
          value={data[indexDay][indexType]}
          onValueChange={toggleValue}
          color={"#3b78a1"}
        />
      </View>
    );
  };


  const styles = StyleSheet.create({
    checkboxDesktop: {
      height: 40,
      width: 40,
    },
    checkboxMobile: {
      height: "80%",
      width: "80%",
    },
  });
  