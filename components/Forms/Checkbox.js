import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Checkbox from "expo-checkbox";

export default function CustomCheckbox({ label, value, setValue, style, labelStyle, checkboxStyle }) {
  return (
    <View
      style={[styles.container, style]}
    >
      <Checkbox
        value={value}
        onValueChange={setValue}
        style={[styles.checkbox, checkboxStyle]}
        color={value ? "#007AFF" : undefined}
      />
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 33,
    height: 33,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginRight: 12,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 18,
    color: "#222",
    fontWeight: "500",
  },
});
