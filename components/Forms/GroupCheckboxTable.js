import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Table, Row, Rows } from "react-native-reanimated-table";
import { DaysOfTheWeek, screeenWidth } from "../../Pages/Meals/common";

const screenWidth = Dimensions.get("window").width;
const isMobile = screenWidth < 768; // Define a breakpoint for mobile

const groupStyles = [
  { color: "#007AFF", fontWeight: "bold" }, // Group 1: Default Blue
  { color: "#005FCC", fontWeight: "bold" }, // Group 2: Slightly darker blue
  { color: "#3399FF", fontWeight: "bold" }, // Group 3: Lighter blue
  { color: "#66B2FF", fontWeight: "bold" }, // Group 4: Even lighter blue
  { color: "#99CCFF", fontWeight: "bold" }, // Group 5: Subtle light blue
];

export default function GroupCheckboxTable({ data, setData }) {
  const [selectedGroups, setSelectedGroups] = useState(
    // Check each day to see if any group is selected, otherwise set to null
    DaysOfTheWeek.map((day, index) => {
        const selectedGroup = Object.keys(data).find(
            (key) => data[key].values[index] === true
        );
        return selectedGroup ? data[selectedGroup].group : null;
    }
  ))


  const handleCheckboxToggle = (key, item, dayIndex) => {
    const newSelectedGroups = [...selectedGroups];
    const newData = { ...data };

    // toggle the checkbox for the specific group and day
    newData[key].values[dayIndex] = !newData[key].values[dayIndex];

    // update the selected group for the day
    if (newData[key].values[dayIndex]) {
      // If the checkbox is being selected, set the group for that day
      newSelectedGroups[dayIndex] = item.group;
    } else {
      // If the checkbox is being deselected, set to null
      newSelectedGroups[dayIndex] = null;
    }
    
    // Now go through all groups and check if any group is selected for that day, if it is, unselect it
    Object.keys(newData).forEach((itemKey) => {
        if (newData[itemKey].group !== item.group && newData[itemKey].values[dayIndex]) {
            // If another group is selected for that day, unselect it
            newData[itemKey].values[dayIndex] = false;
            // Also set the selected group for that day to null
            newSelectedGroups[dayIndex] = null;
        }
    });

    setSelectedGroups(newSelectedGroups);
    setData(newData); // Update the external state

  };

  const headerRow = ["", ...DaysOfTheWeek.slice(1).map((day) => day.charAt(0))];

  const tableRows = Object.keys(data).map((key) => {
    const itemData = data[key];
    const groupStyle =
      Object.keys(data).length > 1 && itemData.group <= groupStyles.length
        ? groupStyles[itemData.group - 1]
        : {}; // Apply group-specific styles if there are multiple groups

    return [
      <Text key={`title-${key}`} style={[styles.groupTitle, groupStyle]}>
        {itemData.title}
      </Text>,
      ...itemData.values.map((value, dayIndex) => (
        <TouchableOpacity
          key={`${key}-${dayIndex}`}
          style={[
            styles.checkbox,
            value ? styles.selectedCheckbox : styles.deselectedCheckbox,
          ]}
          onPress={() => handleCheckboxToggle(key, itemData, dayIndex)}
        />
      )),
    ];
  });

  const flexArr = [2, ...Array(DaysOfTheWeek.slice(1).length).fill(1)];

  return (
    <View style={styles.container}>
      <Table borderStyle={{ borderWidth: 1, borderColor: "#c8e1ff" }}>
        <Row
          data={headerRow}
          style={styles.head}
          textStyle={styles.headerText}
          flexArr={flexArr}
        />
        <Rows
          data={tableRows}
          textStyle={styles.text}
          style={styles.commonRow}
          flexArr={flexArr}
        />
      </Table>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: isMobile ? 5 : 10, // Reduced padding on mobile
  },
  head: {
    height: screeenWidth > 500 ? 40 : 35,
    backgroundColor: "#f1f8ff",
  },
  commonRow: {
    height: screeenWidth > 500 ? 50 : 45, // Adjust row height for larger checkboxes
  },
  text: {
    margin: isMobile ? 3 : 6, // Reduced margin on mobile
    textAlign: "center",
  },
  headerText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  groupTitle: {
    fontSize: isMobile ? 14 : 16, // Adjust font size for mobile
    textAlign: "center",
  },
  checkbox: {
    width: isMobile ? 30 : 40, // Smaller size on mobile
    height: isMobile ? 30 : 40, // Smaller size on mobile
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5, // Slightly rounded corners
    alignSelf: "center", // Center horizontally within the cell
    justifyContent: "center", // Center vertically within the cell
  },
  selectedCheckbox: {
    backgroundColor: "#007AFF", // iOS blue for selected
  },
  deselectedCheckbox: {
    backgroundColor: "white", // Default white for deselected
  },
});
