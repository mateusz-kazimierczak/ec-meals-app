import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Button,
} from "react-native";

import { useState } from "react";
import Checkbox from "expo-checkbox";

import Loader from "../../../../../components/Loader/Loader";

import { useFetch } from "../../../../../_helpers/useFetch";
import useAlert from "../../../../../_helpers/useAlert";

const AddGuests = ({ date, fetch }) => {
  if (!date) return null;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [guestName, setGuestName] = useState("Guest");
  const [dietName, setdietName] = useState("None");

  const cFetch = useFetch();

  const submit = async () => {
    if (!selectedMeal) return useAlert("Error", "Please select a meal");
    if (guestName.length === 0)
      return useAlert("Error", "Please choose guest name");

    setLoading(true);
    const res = await cFetch
      .patch(`${process.env.EXPO_PUBLIC_BACKEND_API}/api/day`, {
        meal: MEALS.indexOf(selectedMeal),
        guest: {
          name: guestName,
          diet: dietName != "None" && dietName != "" ? dietName : null,
        },
        date: buildDayString(date),
      })
      .catch((err) => {
        console.error("Error on adding users: ", err);
        return setLoading(false);
      });

    console.log("Added users: ", res);
    setLoading(false);
    fetch();
    useAlert("Success", "Users added successfully");
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          const newState = !open;
          setOpen(newState);
        }}
      >
        <Text style={styles.mealCatHeader}>Add Guests</Text>
      </TouchableOpacity>
      {open && (
        <View>
          <View style={styles.FormContainer}>
            <View style={styles.formColumn}>
              {MEALS.map((meal, index) => (
                <View style={styles.mealCheckboxContainer} key={index}>
                  <Checkbox
                    value={selectedMeal === meal}
                    onValueChange={() => setSelectedMeal(meal)}
                  />
                  <Text style={styles.mealCheckBoxLabel}>{meal}</Text>
                </View>
              ))}
            </View>
            <View style={styles.formColumn}>
              <View>
                <Text style={styles.mealCheckBoxLabel}>Guest Name:</Text>
                <TextInput
                  placeholder="Name of Guest"
                  value={guestName}
                  onChangeText={setGuestName}
                />

                <Text style={styles.mealCheckBoxLabel}>Diet:</Text>
                <TextInput
                  placeholder="Diet"
                  value={dietName}
                  onChangeText={setdietName}
                />
              </View>
            </View>
          </View>
          <Button title="Submit" onPress={submit} disabled={loading} />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  mealCatHeader: {
    fontSize: 25,
    fontWeight: "600",
    marginBottom: 10,
    backgroundColor: "#126300",
    color: "white",
    padding: 10,
    borderRadius: 10,
  },
  FormContainer: {
    margin: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#3b78a1",
    backgroundColor: "whitesmoke",

    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start", // if you want to fill rows left to right
  },

  formColumn: {
    width: "50%",
    padding: 10,
  },

  mealCheckboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  singleUserContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  userCheckboxLabel: {
    paddingLeft: 10,
  },

  mealCheckBoxLabel: {
    fontSize: 15,
    fontWeight: "bold",
    paddingLeft: 10,
  },

  userListContainer: {
    minHeight: 100,
  },
});

const MEALS = ["Breakfast", "Lunch", "Dinner", "P1", "P2", "PS"];

const buildDayString = (date) => {
  if (typeof date === "string") return date;

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

export default AddGuests;
