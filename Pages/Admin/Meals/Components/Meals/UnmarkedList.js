import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";

import { useState } from "react";

const UnmarkedList = ({ unmarked, noMeals }) => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(!open)}>
        <Text style={styles.mealCatHeader}>Unmarked</Text>
      </TouchableOpacity>

      <View>
        {unmarked && open && (
          <>
            <Text style={styles.mealTypeHeader}>Unmarked</Text>
            <View style={styles.mealInfoContainer}>
              {unmarked.map((person, index) => (
                <Text key={index}>{person.name}</Text>
              ))}
            </View>
          </>
        )}

        {noMeals && open && (
          <>
            <Text style={styles.mealTypeHeader}>No Meals</Text>
            <View style={styles.mealInfoContainer}>
              {noMeals.map((person, index) => (
                <Text key={index}>{person.name}</Text>
              ))}
            </View>
          </>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  mealCatHeader: {
    fontSize: 25,
    fontWeight: "600",
    marginBottom: 10,
    backgroundColor: "#fcba03",
    color: "white",
    padding: 10,
    borderRadius: 10,
  },
  mealInfoContainer: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#3b78a1",
    backgroundColor: "whitesmoke",
  },
  mealTypeHeader: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default UnmarkedList;
