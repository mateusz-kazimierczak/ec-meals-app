import React, {useEffect, useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  Header,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions
} from "react-native";

const screeenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

import Loader from "../../../../components/Loader/Loader";

import Container from "../../../../components/Container/Container";

import { useAtom } from "jotai";
import { authAtom } from "../../../../_helpers/Atoms";
import { useFetch } from "../../../../_helpers/useFetch";

import Icons from "@expo/vector-icons/Ionicons";
import { set } from "react-hook-form";

import SingleBirthday from "./SingleBirthday";


export default function HomeBirthdays() {
  const [loading, setLoading] = useState(false);
  const [birthdays, setBirthdays] = useState(null);
  const cFetch = useFetch();

  useEffect(
    () => {
      fetchBirthdays();
    }, []);
  
    const fetchBirthdays = async () => {
      console.log("fetchBirthdays");
      setLoading(true);
      const res = await cFetch
        .get(`${process.env.EXPO_PUBLIC_BACKEND_API}/api/home/birthdays`)
        .catch((err) =>
          console.log("Error while fetching data from server: ", err)
        );
  
        console.log("Birthdays: ", res);

      setLoading(false);
      setBirthdays(res.birthdayDisplay);
    };
    return (
        <View style={styles.outerContainer}>
              <Loader loading={loading}>
                <View style={styles.birthdaysContainer}>
                   <Text style={styles.headTitle}>Birthdays</Text>
                   <Icons name="balloon-outline" size={40} color={"#3b78a1"} />
                </View>
                <View>
                  {(Array.isArray(birthdays) && birthdays && birthdays.length > 0) ?
                    birthdays.map(
                      (birthday) =>
                        birthday && <SingleBirthday key={birthday.id} birthday={birthday} />
                    ) :
                    <Text style={styles.headTitle} >No birthdays to show</Text>
                    }
                </View>
              </Loader>
            </View>
    );
}


const styles = StyleSheet.create({
  birthdaysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  outerContainer: {
    padding: 5,
    minHeight: screenHeight * 0.15,
  },
  headTitle: {
    textAlign: "center",
    fontSize: 30,
    color: "#3b78a1",
    fontWeight: "600",
  },
});