import React from "react";
import { View, Text, StyleSheet } from "react-native";


export default function SingleBirthday({ birthday }) {
    const daysDisplayTextLabel = birthday.days === 1 ? "day" : "days";
    const daysDisplayText = birthday.days == 0 ? "today" : `${birthday.days} ${daysDisplayTextLabel}`;
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{birthday.name}</Text>
      <Text style={styles.date}>{daysDisplayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 10,
    backgroundColor: "whitesmoke",
    borderRadius: 15,
  },
  name: {
    fontSize: 20,
  },
  date: {
    fontSize: 15,
  },
});