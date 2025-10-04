import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  Button,
  ScrollView,
} from "react-native";
import { Platform } from 'react-native';


import React, { useEffect, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";

import { Table, TableWrapper, Row, Rows } from "react-native-reanimated-table";


import Loader from "../../components/Loader/Loader";

import { useFetch } from "../../_helpers/useFetch";

import MealHeader from "./MealHeader";
import useTimer from "../../_helpers/useTimer";

import { MealTypes, DaysOfTheWeek, screeenWidth, SavedStatusColor } from "./common";

import DayCheckbox from "./DayCheckbox";


export default function Week({ user_id, setSaveState }) {
  const [mealData, setMealData] = useState(
    DaysOfTheWeek.slice(1).map((day) => MealTypes.map((meal) => false))
  );
  const [firstName, setFirstName] = useState("");
  const [disabledDay, setDisabledDay] = useState(undefined);

  const [loading, setLoading] = useState(true);
  const [updateState, setUpdateState] = useState(false);
  
  // Get actual device width
  const deviceWidth = Dimensions.get("window").width;
  const isSmallScreen = deviceWidth < 500;

  useEffect(() => {
    console.log("updateState: ", updateState);
    console.log("loading: ", loading);
    if (updateState) {
      setSaveState(0);
    }
    else if (loading) {
      setSaveState(1);
    } else {
      setSaveState(2);
    }  }
  , [loading, updateState]);

  
  const cFetch = useFetch();

  const [timerText, setTimer] = useTimer({
    nextCall: () => fetchMeals(),
  });

  useEffect(() => {
    const handleBeforeUnload = (event) => {

      // use AppState on react native

      if (updateState) return;

      event.preventDefault();
      event.returnValue = "";
      cFetch
      .post(
        `${process.env.EXPO_PUBLIC_BACKEND_API}/api/meals`,
        { meals: mealData },
        { forUser: user_id }
      )
      .catch((err) =>
        console.log("Error while fetching data from server: ", err)
      );
    };

    // If the device is web, setup beforeunload event listener
    if (Platform.OS === 'web') {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      if (Platform.OS === 'web') {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
      
    };
  }, [mealData, user_id]);

  const fetchMeals = async () => {
    setLoading(true);

    const res = await cFetch
      .get(`${process.env.EXPO_PUBLIC_BACKEND_API}/api/meals`, null, {
        forUser: user_id,
      })
      .catch((err) => {
        console.log("Error while fetching data from server: ", err);
        return null; // Return null explicitly when there's an error
      });
      
    // Check if res exists and has the expected properties
    if (res && res.meals !== undefined) {
      setMealData(res.meals);
    }
    
    if (res && res.updateTime !== undefined) {
      setTimer(res.updateTime);
    }
    
    if (res && res.disabledDay !== undefined) {
      setDisabledDay(user_id ? undefined : res.disabledDay);
    }
    
    if (res && res.firstName !== undefined) {
      setFirstName(res.firstName);
    }
    
    setUpdateState(true);
    setLoading(false);
  };

  const TableData = MealTypes.map((day, indexType) =>
    [day].concat(
      DaysOfTheWeek.slice(1).map((val, indexDay) => (
        <DayCheckbox
          data={mealData}
          setData={setMealData}
          indexDay={indexDay}
          indexType={indexType}
          setUpdateState={setUpdateState}
          disabledDay={disabledDay}
        />
      ))
    )
  );

  const SaveData = async () => {
    setLoading(true);
    const res = await cFetch
      .post(
        `${process.env.EXPO_PUBLIC_BACKEND_API}/api/meals`,
        { meals: mealData },
        { forUser: user_id }
      )
      .catch((err) =>
        console.log("Error while fetching data from server: ", err)
      );
    setUpdateState(true);
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log("API: ", process.env.EXPO_PUBLIC_BACKEND_API);
      fetchMeals();
    }, [])
  );

  return (
    <>
      <Loader
        loading={loading}
        warningIconName={"cloud-upload-outline"}
        warning={false}
        warningMessage={timerText}
      >
        <MealHeader
          updateState={updateState}
          nextUpdateTime={timerText}
          name={firstName}
        />
        <View style={styles.container}>
          <Table borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}>
            <Row
              data={DaysOfTheWeek}
              style={isSmallScreen ? styles.headSmall : styles.head}
              textStyle={isSmallScreen ? styles.headerTextRotated : styles.headerText}
            />
            <Rows
              data={TableData}
              textStyle={styles.text}
              style={isSmallScreen ? styles.commonRowSmall : styles.commonRow}
            />
          </Table>
          <View style={{ margin: isSmallScreen ? 5 : 20 }}>
            <Button title="Submit" onPress={SaveData} />
          </View>
        </View>
      </Loader>
    </>
  );
}


// Styling --- 

const TEXT_LENGTH = 100;
const TEXT_HEIGHT = 30;
const OFFSET = TEXT_LENGTH / 2 - TEXT_HEIGHT / 2;

const styles = StyleSheet.create({
  commonRow: { 
    height: 60,
  },
  commonRowSmall: { 
    height: 50,
  },
  head: { 
    height: 30, 
    backgroundColor: "#f1f8ff",
  },
  headSmall: { 
    height: 100, 
    backgroundColor: "#f1f8ff",
  },
  text: { 
    margin: 6,
  },
  headerText: {
    margin: 6,
    padding: 5,
    fontWeight: "bold",
    width: TEXT_LENGTH,
    height: TEXT_HEIGHT,
  },
  headerTextRotated: Platform.select({
    ios: {
      margin: 6,
      padding: 5,
      fontWeight: "bold",
      width: TEXT_LENGTH,
      height: TEXT_HEIGHT,
      transform: [
        { rotate: "-90deg" },
        { translateY: -OFFSET },
      ],
      writingDirection: 'ltr',
    },
    android: {
      margin: 6,
      padding: 5,
      fontWeight: "bold",
      width: TEXT_LENGTH,
      height: TEXT_HEIGHT,
      transform: [
        { rotate: "-90deg" },
        { translateY: -OFFSET },
      ],
    },
    default: {
      margin: 6,
      padding: 5,
      fontWeight: "bold",
      width: TEXT_LENGTH,
      height: TEXT_HEIGHT,
      transform: [
        { rotate: "-90deg" },
        { translateY: -OFFSET },
      ],
    },
  }),
  noMealsRow: {
    backgroundColor: "red",
  },
});
