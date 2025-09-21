import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";

export default function OverviewCategoryDisplay({
  mealCategory,
  mealData,
  index,
}) {
  return (
    <View key={`${index}`} style={styles.singleOverviewContainer}>
      <View style={styles.GlobalOverviewContainer}>
        <Text style={styles.mealTypeHeader}>{mealCategory}: </Text>
        <Text>{getNSignedUp(mealData)}</Text>
      </View>
      <View>
        {Object.entries(generateDietCounters(mealData))?.map(
          ([diet, count]) => {
            return <Text key={diet}>{`${diet}: ${count}`}</Text>;
          }
        )}
      </View>
    </View>
  );
}

const getNSignedUp = (day) => {
  return day.reduce((acc, meal) => {
    if (meal) {
      return acc + 1;
    } else {
      return acc;
    }
  }, 0);
};

const generateDietCounters = (mealData) => {
  if (mealData.length === 0) return {};

  const diets = { Normal: 0 };

  mealData.forEach((user) => {
    if (user.diet) {
      // If user has a specific diet
      if (diets[user.diet]) {
        diets[user.diet] += 1;
      } else {
        diets[user.diet] = 1;
      }
    } else {
      // If user has no diet
      diets["Normal"] += 1;
    }
  });
  return diets;
};

const styles = StyleSheet.create({
  mealTypeHeader: {
    fontSize: 20,
    fontWeight: "bold",
  },
  singleOverviewContainer: {
    flexDirection: "column",
    padding: 10,
    backgroundColor: "whitesmoke",
    borderColor: "#3b78a1",
    borderWidth: 1,
    borderRadius: 10,
    width: "45%",
    margin: 5,
  },
  GlobalOverviewContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
});
