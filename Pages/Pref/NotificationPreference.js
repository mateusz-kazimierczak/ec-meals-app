import { StyleSheet, View, Dimensions, Text, Button, TouchableOpacity } from "react-native";
import DeepNavLink from "../../components/header/DeepNavLinks/DeepNavLinks";
import Container from "../../components/Container/Container";
import Loader from "../../components/Loader/Loader";
import { useEffect, useState } from "react";
import { useFetch } from "../../_helpers/useFetch";
import { DaysOfTheWeek, screeenWidth } from "../../Pages/Meals/common";

import { useAtom } from "jotai";
import { authAtom } from "../../_helpers/Atoms";
import { set } from "react-hook-form";

import Checkbox from "expo-checkbox";
import GroupCheckboxTable from "../../components/Forms/GroupCheckboxTable"; // Import the reusable component

import platformAlert from "../../_helpers/useAlert";

export default function NotificationPreferences({ navigation, route }) {
  const cFetch = useFetch();
  const [loading, setLoading] = useState(false);
  const [emailPref, setEmailPref] = useState(1);
  const [persistMeals, setPersistMeals] = useState(false);
  const [skipNotSignedUp, setSkipNotSignedUp] = useState(false);
  const [allowNextWeek, setAllowNextWeek] = useState(false);
  const [name, setName] = useState("");
  const [auth, setAuth] = useAtom(authAtom);

  const [data, setData] = useState({
    none_marked: {
      title: "None Marked",
      values: [true, false, true, false, false, true, false],
      group: 1,
    },
    another_group: {
      title: "No normal meals",
      values: [false, false, false, false, false, false, false],
      group: 2,
    },
    third_group: {
      title: "No packed meals",
      values: [false, false, false, false, false, false, false],
      group: 2,
    },
    fourth_group: {
      title: "Daily report",
      values: [false, false, false, false, false, false, false],
      group: 3,
    },
  });

  const [selectedCell, setSelectedCell] = useState(null); // Track the selected cell
  const [details, setDetails] = useState(""); // Track details for the selected cell

  const tableData = ["Morning", "Noon", "Evening"].map((time) => [
    time,
    ...DaysOfTheWeek.slice(1).map(() => false), // Initialize cells as false
  ]);

  const handleCellClick = (rowIndex, colIndex) => {
    setSelectedCell({ row: rowIndex, col: colIndex });
    setDetails(`Details for ${tableData[rowIndex][0]} on ${DaysOfTheWeek[colIndex + 1]}`);
  };

  const headerRow = ["", ...DaysOfTheWeek.slice(1)]; // Full names of the days

  const flexArr = [2, ...Array(DaysOfTheWeek.slice(1).length).fill(1)];

  useEffect(() => {
    loadPreferences();
  }, [route]);

  const loadPreferences = async () => {
    setLoading(true);
    const res = await cFetch.get(
      `${process.env.EXPO_PUBLIC_BACKEND_API}/api/preferences`,
      null,
      {
        user_id: route.params.forUser,
      }
    );
    console.log("Preferences: ", res, route.params.forUser);
    setEmailPref(res.preferences.email);
    setPersistMeals(res.preferences.persistMeals);
    setAllowNextWeek(res.preferences.allowNextWeek);
    setSkipNotSignedUp(res.preferences.skipNotSignedUp);
    setName(res.firstName);
    setLoading(false);
  };

  const savePreferences = async () => {
    setLoading(true);

    const preferences = await cFetch.post(
      `${process.env.EXPO_PUBLIC_BACKEND_API}/api/preferences`,
      {
        email: emailPref,
        persistMeals: persistMeals,
        allowNextWeek: allowNextWeek,
        skipNotSignedUp: skipNotSignedUp,
      },
      {
        user_id: route.params.forUser,
      }
    );
    setLoading(false);
    navigation.navigate(route.params.returnPaths[route.params.returnPaths.length - 1]);
    platformAlert("Success", "Preferences saved");
  };

  return (
    <>
      <DeepNavLink routes={route.params.returnPaths} navigation={navigation} />

      <Container>
        <Loader loading={loading}>
          {route.params.forUser && !loading && (
            <Text style={{ fontSize: 30, color: "#3b78a1" }}>
              {name}'s Notification Preferences
            </Text>
          )}

          <Text style={styles.pageHeader}>Notification Preferences</Text>
          <View style={styles.tableContainer}>
            <View style={styles.table}>
              <View style={styles.row}>
                {headerRow.map((header, index) => (
                  <Text key={`header-${index}`} style={styles.headerCell}>
                    {header}
                  </Text>
                ))}
              </View>
              {tableData.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.row}>
                  {row.map((cell, colIndex) => (
                    <TouchableOpacity
                      key={`cell-${rowIndex}-${colIndex}`}
                      style={[
                        styles.cell,
                        selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                          ? styles.selectedCell
                          : styles.deselectedCell,
                      ]}
                      onPress={() => handleCellClick(rowIndex, colIndex)}
                    >
                      <Text style={styles.cellText}>
                        {colIndex === 0 ? cell : cell ? "✓" : ""}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>
          {selectedCell && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsText}>{details}</Text>
              {/* Add more options and details here */}
            </View>
          )}

          <Text style={styles.optionGroupLabel}>Notification Scheme:</Text>
          <GroupCheckboxTable data={data} setData={setData} /> {/* Pass state data to the component */}

          <Text style={styles.optionGroupLabel}>Email Preferences:</Text>
          <View style={styles.singleOptionContainer}>
            <Checkbox
              style={styles.checkbox}
              onValueChange={() => setEmailPref(0)}
              value={emailPref == 0}
            />
            <Text style={styles.singleOptionTextLabel}>No emails</Text>
          </View>
          <View style={styles.singleOptionContainer}>
            <Checkbox
              style={styles.checkbox}
              onValueChange={() => setEmailPref(1)}
              value={emailPref == 1}
            />
            <Text style={styles.singleOptionTextLabel}>
              Only email if no meals marked:
            </Text>
          </View>
          <View style={styles.singleOptionContainer}>
            <Checkbox
              style={styles.checkbox}
              onValueChange={() => setEmailPref(2)}
              value={emailPref == 2}
            />
            <Text style={styles.singleOptionTextLabel}>Daily meal report:</Text>
          </View>

          <Text style={styles.optionGroupLabel}>Usage Preferences:</Text>
          <View style={styles.singleOptionContainer}>
            <Checkbox
              style={styles.checkbox}
              onValueChange={() => setAllowNextWeek(!allowNextWeek)}
              value={allowNextWeek}
            />
            <Text style={styles.singleOptionTextLabel}>Allow mark next week:</Text>
          </View>

          {route.params.forUser && !loading && (
            <>
              <Text style={styles.optionGroupLabel}>Admin Preferences:</Text>
              <View style={styles.singleOptionContainer}>
                <Checkbox
                  style={styles.checkbox}
                  onValueChange={() => setPersistMeals(!persistMeals)}
                  value={persistMeals}
                />
                <Text style={styles.singleOptionTextLabel}>Persist Meals:</Text>
              </View>

              <View style={styles.singleOptionContainer}>
                <Checkbox
                  style={styles.checkbox}
                  onValueChange={() => setSkipNotSignedUp(!skipNotSignedUp)}
                  value={skipNotSignedUp}
                />
                <Text style={styles.singleOptionTextLabel}>
                  Do not include in "Not signed up" for meals:
                </Text>
              </View>
            </>
          )}
          <View>
            <Button title="Save" onPress={savePreferences} />
          </View>

          
        </Loader>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  singleOptionContainer: {
    flexDirection: "row",
    marginVertical: "0.5em",
    marginHorizontal: "0",
  },
  singleOptionTextLabel: {
    fontSize: 18,
    marginLeft: "0.5em",
  },
  checkbox: {
    height: 18,
    width: 18,
  },
  optionGroupLabel: {
    fontSize: 30,
    textDecorationLine: "underline",
    color: "#3b78a1",
  },
  pageHeader: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#3b78a1",
  },
  tableContainer: {
    marginVertical: 20,
  },
  table: {
    borderWidth: 1,
    borderColor: "#c8e1ff",
  },
  row: {
    flexDirection: "row",
  },
  headerCell: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f1f8ff",
    fontWeight: "bold",
    textAlign: "center",
  },
  cell: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#c8e1ff",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCell: {
    backgroundColor: "#007AFF",
  },
  deselectedCell: {
    backgroundColor: "#ffffff",
  },
  cellText: {
    fontSize: 16,
    textAlign: "center",
  },
  detailsContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#c8e1ff",
    backgroundColor: "#f9f9f9",
  },
  detailsText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
});
