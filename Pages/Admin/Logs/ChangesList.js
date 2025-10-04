import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Button,
} from "react-native";
import { useState, useEffect } from "react";

import MealDisplay from '../../Meals/SimpleWeek';
// Assuming MealTypes and DaysOfTheWeek might be needed for robust parsing or default structures.
// If SimpleWeek handles defaults well, these might not be strictly necessary here.
// import { MealTypes, DaysOfTheWeek } from '../../Meals/common'; 

const ITEMS_PER_PAGE = 20;

// Helper function to format date and time
const formatDateTime = (isoString) => {
  if (!isoString) return "Invalid Date";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Invalid Date"; // Check if date is valid
    // Format: Full Day Name, HH:MM:SS AM/PM
    return date.toLocaleString(undefined, { 
      weekday: 'long', // Changed from 'short' to 'long' for full day name
      // year: 'numeric', // Removed year
      // month: 'short', // Removed month
      // day: 'numeric', // Removed day
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit' // Added seconds
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

// Function to calculate the difference between old and new meal states
const calculateDifference = (oldMealsStr, newMealsStr) => {
  try {
    const oldMeals = JSON.parse(oldMealsStr || "[]");
    const newMeals = JSON.parse(newMealsStr || "[]");

    // Assuming a fixed structure based on typical meal app (e.g., 7 meal types, 7 days)
    // A more robust solution might involve passing MealTypes.length and DaysOfTheWeek.length-1
    // or ensuring the parsed arrays are of expected dimensions.
    const numMealTypes = oldMeals.length > 0 ? oldMeals.length : (newMeals.length > 0 ? newMeals.length : 0); // Or a constant
    const numDays = oldMeals.length > 0 && oldMeals[0].length > 0 ? oldMeals[0].length : (newMeals.length > 0 && newMeals[0].length > 0 ? newMeals[0].length : 0); // Or a constant

    if (numMealTypes === 0 || numDays === 0) {
        // Return an empty array or a default structure if parsing fails or arrays are empty
        // This matches SimpleWeek's defaultMeals structure if needed.
        // For simplicity, returning empty if dimensions can't be inferred.
        return []; 
    }
    
    const diffMeals = [];

    for (let i = 0; i < numMealTypes; i++) {
      diffMeals[i] = [];
      for (let j = 0; j < numDays; j++) {
        const oldVal = oldMeals[i]?.[j] || false; // Default to false if undefined
        const newVal = newMeals[i]?.[j] || false; // Default to false if undefined

        if (oldVal === false && newVal === true) {
          diffMeals[i][j] = 1; // Added
        } else if (oldVal === true && newVal === false) {
          diffMeals[i][j] = -1; // Removed
        } else if (oldVal === true && newVal === true) {
          diffMeals[i][j] = true; // Unchanged (was true, still true)
        } else {
          diffMeals[i][j] = false; // Unchanged (was false, still false) or invalid
        }
      }
    }
    return diffMeals;
  } catch (e) {
    console.error("Error parsing or calculating meal difference:", e);
    return []; // Return empty array on error
  }
};


export default function ChangesList({ mealData }) {
  const [currentPage, setCurrentPage] = useState(0);
  // expandedItems now stores { isOpen: boolean, viewMode: 'detail' | 'difference' }
  const [expandedItems, setExpandedItems] = useState({}); 

  if (!mealData || mealData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No meal changes found.</Text>
      </View>
    );
  }

  // Sort data by CHANGE_TIME descending (most recent first)
  const sortedMealData = [...mealData].sort((a, b) => {
    const dateA = new Date(a.CHANGE_TIME?.value);
    const dateB = new Date(b.CHANGE_TIME?.value);
    return dateB - dateA;
  });


  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = sortedMealData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedMealData.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: {
        isOpen: !prev[id]?.isOpen,
        viewMode: prev[id]?.viewMode || 'difference', // Default to difference view or keep current
      }
    }));
  };

  const setViewMode = (id, mode) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        viewMode: mode,
      }
    }));
  };

  const renderChangeItem = ({ item, index }) => {
    const uniqueItemId = `${item.CHANGE_TIME?.value}-${index}`;
    const currentItemState = expandedItems[uniqueItemId] || { isOpen: false, viewMode: 'difference' }; // Default viewMode to difference
    const { isOpen, viewMode } = currentItemState;

    let differenceMealsData = [];
    if (isOpen && viewMode === 'difference') {
      differenceMealsData = calculateDifference(item.OLD_MEALS, item.NEW_MEALS);
    }

    const isSystemChange = item.IS_SYSTEM_CHANGE === true || item.IS_SYSTEM_CHANGE === 'true' || item.IS_SYSTEM_CHANGE === 1;


    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => toggleExpand(uniqueItemId)}>
          <View style={styles.itemHeader}>
            <View style={styles.timeAndChangeTypeContainer}>
              <Text style={styles.timeText}>
                {formatDateTime(item.CHANGE_TIME?.value)}
              </Text>
              <Text style={isSystemChange ? styles.systemChangeText : styles.userChangeText}>
                {isSystemChange ? 'System Change' : 'User Change'}
              </Text>
            </View>
            <Text style={styles.expandIcon}>{isOpen ? '▼' : '▶'}</Text>
          </View>
        </TouchableOpacity>
        {isOpen && (
          <View style={styles.detailsContainer}>
            <View style={styles.viewModeToggleContainer}>
              <TouchableOpacity 
                style={[styles.viewModeButton, viewMode === 'difference' && styles.viewModeButtonActive]}
                onPress={() => setViewMode(uniqueItemId, 'difference')}>
                <Text style={[styles.viewModeButtonText, viewMode === 'difference' && styles.viewModeButtonTextActive]}>Difference</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.viewModeButton, viewMode === 'detail' && styles.viewModeButtonActive]}
                onPress={() => setViewMode(uniqueItemId, 'detail')}>
                <Text style={[styles.viewModeButtonText, viewMode === 'detail' && styles.viewModeButtonTextActive]}>Details</Text>
              </TouchableOpacity>
            </View>

            {viewMode === 'detail' && (
              <>
                <Text style={styles.detailsTitle}>Old Meals:</Text>
                <MealDisplay displayMeals={item.OLD_MEALS} />
                <Text style={styles.detailsTitle}>New Meals:</Text>
                <MealDisplay displayMeals={item.NEW_MEALS} />
              </>
            )}
            {viewMode === 'difference' && (
              <>
                <Text style={styles.detailsTitle}>Meal Differences:</Text>
                <MealDisplay displayMeals={differenceMealsData} />
              </>
            )}
          </View>
        )}
      </View>
    );
  };
 
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meal Change History</Text>
      <FlatList
        data={paginatedData}
        renderItem={renderChangeItem}
        keyExtractor={(item, index) => `${item.USER_ID}-${item.CHANGE_TIME?.value}-${index}`} // Ensure unique keys
        ListEmptyComponent={<Text style={styles.noDataText}>No changes for this page.</Text>}
      />
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <Button
            title="Previous"
            onPress={handlePreviousPage}
            disabled={currentPage === 0}
          />
          <Text style={styles.pageInfoText}>
            Page {currentPage + 1} of {totalPages}
          </Text>
          <Button
            title="Next"
            onPress={handleNextPage}
            disabled={currentPage >= totalPages - 1}
          />
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    paddingTop: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  itemContainer: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeAndChangeTypeContainer: { // New container for time and change type
    flex: 1,
    marginRight: 10, // Add some space before the expand icon
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    // flex: 1, // Removed flex from here as parent container handles it
  },
  systemChangeText: {
    fontSize: 12,
    color: '#007AFF', // iOS System Blue
    fontWeight: '500',
    marginTop: 2,
  },
  userChangeText: {
    fontSize: 12,
    color: '#34C759', // iOS System Green
    fontWeight: '500',
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 18,
    color: '#333',
    marginLeft: 10,
  },
  detailsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailsTitle: {
    fontSize: 14, // Slightly larger for better readability
    fontWeight: 'bold',
    color: '#444', // Darker color
    marginTop: 8,
    marginBottom: 4, // Add some space below title
  },
  detailsText: {
    fontSize: 12,
    color: '#444',
    marginTop: 2,
    marginBottom: 8,
    // Potentially wrap long strings if they are very long
    // whiteSpace: 'pre-wrap', // This is for web, React Native handles text wrapping by default
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  pageInfoText: {
    fontSize: 14,
  },
  viewModeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center buttons
    marginBottom: 10,
  },
  viewModeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20, // More rounded buttons
    borderWidth: 1,
    borderColor: '#007AFF', // iOS blue or your theme color
    marginHorizontal: 5,
  },
  viewModeButtonActive: {
    backgroundColor: '#007AFF',
  },
  viewModeButtonText: {
    color: '#007AFF',
    fontSize: 13,
    textAlign: 'center',
  },
  viewModeButtonTextActive: {
    color: '#FFFFFF',
  }
});
