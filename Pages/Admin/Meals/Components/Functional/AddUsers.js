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

const AddUsers = ({ date, fetch }) => {
  if (!date) return null;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const cFetch = useFetch();

  const submit = async () => {
    if (!selectedMeal) return useAlert("Error", "Please select a meal");
    if (selectedUsers.length === 0)
      return useAlert("Error", "Please select at least one user");

    setLoading(true);
    const res = await cFetch
      .patch(`${process.env.EXPO_PUBLIC_BACKEND_API}/api/day`, {
        meal: selectedMeal,
        users: selectedUsers,
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

  const fetchUsers = async () => {
    setLoading(true);
    const users = await cFetch.get(
      `${process.env.EXPO_PUBLIC_BACKEND_API}/api/users/all`
    );
    if (users) setUsers(users);
    setLoading(false);
    console.log(users);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          const newState = !open;
          setOpen(newState);
          if (newState) fetchUsers();
        }}
      >
        <Text style={styles.mealCatHeader}>Add users</Text>
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
                <TextInput
                  placeholder="Search by first name"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <ScrollView>
                <Loader loading={loading}>
                  <View style={styles.userListContainer}>
                    {users
                      .filter((user) =>
                        user.firstName
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((user, index) => (
                        <View key={user.id} style={styles.singleUserContainer}>
                          <Checkbox
                            value={selectedUsers.includes(user.id)}
                            onValueChange={() => {
                              if (selectedUsers.includes(user.id)) {
                                setSelectedUsers(
                                  selectedUsers.filter((id) => id !== user.id)
                                );
                              } else {
                                setSelectedUsers([...selectedUsers, user.id]);
                              }
                            }}
                          />
                          <Text style={styles.userCheckboxLabel}>
                            {user.firstName} {user.lastName}
                          </Text>
                        </View>
                      ))}
                  </View>
                </Loader>
              </ScrollView>
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

export default AddUsers;
