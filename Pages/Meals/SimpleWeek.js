import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  ScrollView,
} from "react-native";

import React from "react";

import { Table, Row, Rows } from "react-native-reanimated-table";

import { ShortMealTypes, DaysOfTheWeek, screeenWidth } from "./common";

// Default empty meals structure: MealTypes rows, Days columns
// displayMeals[mealTypeIndex][dayIndex]
const defaultMeals = ShortMealTypes.map(() => Array(DaysOfTheWeek.slice(1).length).fill(false));

// Simple component to display a meal cell
const MealCell = ({ selected }) => {
  let cellStyle;
  if (selected === 1) {
    cellStyle = styles.addedCell; // Green for 1
  } else if (selected === -1) {
    cellStyle = styles.removedCell; // Red for -1
  } else if (selected === true) {
    cellStyle = styles.selectedCell; // Blue for true
  } else {
    cellStyle = styles.deselectedCell; // White for false or undefined
  }

  return (
    <View style={[styles.cell, cellStyle]}>
      {/* Optionally, display text like "✓" or "X", or keep it purely visual */}
    </View>
  );
};


export default function Week({ displayMeals = defaultMeals }) {

    // convert from json
    let parsedDisplayMeals = Array.isArray(displayMeals) ? displayMeals : JSON.parse(displayMeals || "[]");
    
  // mealData is [MealTypeIndex][DayIndex]
  const mealData = parsedDisplayMeals && 
                   parsedDisplayMeals.length === ShortMealTypes.length && 
                   parsedDisplayMeals[0] && 
                   parsedDisplayMeals[0].length === DaysOfTheWeek.slice(1).length 
    ? parsedDisplayMeals 
    : defaultMeals;

  // Column Headers: Empty top-left cell, then Day initials
  const columnHeaderData = [
    "", // For the corner above Meal Type row headers
    ...DaysOfTheWeek.slice(1).map(day => day.charAt(0)) // "M", "T", "W", ..., "S"
  ];

  // TableData: Rows are MealTypes. For each MealType, first cell is MealType name,
  // then cells for each day, accessing mealData[dayIndex][mealTypeIndex] for transposed view.
  const tableRowsData = ShortMealTypes.map((mealType, indexType) => // indexType is the meal type index
    [mealType].concat( // First cell in row is MealType name
      DaysOfTheWeek.slice(1).map((day, indexDay) => { // indexDay is the day index
        // Access data in a "transposed" manner: mealData[dayIndex][mealTypeIndex]
        // This assumes mealData's primary index is meal type, secondary is day.
        // For display, we want cell (mealType, day) to show data from (day, mealType)
        // from the original data matrix if it were indexed [day][mealtype].
        // Since mealData is [mealType][day], and we want to show data as if source was transposed:
        // The cell for (current row = mealType `indexType`, current col = day `indexDay`)
        // should show data from `mealData` at `mealData[indexDay][indexType]` if `mealData`
        // was `Days x MealTypes`.
        // However, `mealData` is `MealTypes x Days`.
        // So, for the visual cell (MealType `indexType`, Day `indexDay`),
        // to show "transposed data", we show `mealData[indexDay][indexType]`.
        // This requires `mealData[indexDay]` to be a valid row (a meal type's data)
        // and `mealData[indexDay][indexType]` to be a specific day's data for that meal type.
        // This is only valid if MealTypes.length === DaysOfTheWeek.slice(1).length. Both are 7.
        const val = mealData[indexDay] !== undefined && mealData[indexDay][indexType] !== undefined 
                    ? mealData[indexDay][indexType] 
                    : false; // Default to false if access is out of bounds (should not happen for 7x7)
        return (
          <MealCell
            key={`${indexType}-${indexDay}`}
            selected={val}
          />
        );
      })
    )
  );

  // Flex array for column widths: 1.5 for MealType names column, 1 for each Day column

  return (
    <>
      <View style={styles.container}>
        <Table borderStyle={{ borderWidth: 1, borderColor: "#c8e1ff" }}>
          <Row
            data={columnHeaderData} // Column headers are Day initials
            style={styles.head}
            textStyle={styles.headerText} // Styles Day initials
          />
          <Rows
            data={tableRowsData} // Row data starts with MealType names
            textStyle={styles.text} // Styles MealType names in the first column of data rows
            style={styles.commonRow}
          />
        </Table>
      </View>
    </>
  );
}


// Styling --- 

// const TEXT_LENGTH = 100; 
// const TEXT_HEIGHT = 30;
// const OFFSET = TEXT_LENGTH / 2 - TEXT_HEIGHT / 2;

const styles = StyleSheet.create({
  commonRow: { height: screeenWidth > 500 ? 40 : 35 }, 
  head: { height: screeenWidth > 500 ? 40 : 35, backgroundColor: "#f1f8ff" },
  text: { // Style for the first cell in data rows (MealType Names)
    margin: 6, 
    textAlign: 'left', 
    fontWeight: '500',
    paddingLeft: 5,
  }, 
  headerText: { // Style for header cells (Day Initials)
    margin: 0, 
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
    // transform: screeenWidth < 500 && [ ... ], // Rotation for day initials if needed
  },
  container: { 
    padding: 5,
  },
  cell: {
    flex: 1, 
    height: '100%', 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#eee', 
  },
  selectedCell: {
    backgroundColor: '#007AFF', // Blue (iOS system blue)
  },
  deselectedCell: {
    backgroundColor: 'white', // False remains white
  },
  addedCell: {
    backgroundColor: '#34C759', // iOS system green
  },
  removedCell: {
    backgroundColor: '#FF3B30', // iOS system red
  },

});
