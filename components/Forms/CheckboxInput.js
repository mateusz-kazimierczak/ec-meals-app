import { Controller } from "react-hook-form";
import { View, Text, TextInput, StyleSheet } from "react-native";

import Checkbox from "expo-checkbox";

export default function CTextInput({
  control,
  name,
  label,
  errors,
  defaultValue,
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        defaultValue={defaultValue || false}
        render={({ field: { onChange, value } }) => (
          <Checkbox onValueChange={onChange} value={value} />
        )}
        name={name}
      />

      {errors[name] && <Text style={styles.errorText}>{errors[name].message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    margin: 10,
    fontSize: 20,
  },
  input: {
    marginTop: 5,
    margin: 10,
    backgroundColor: "whitesmoke",
    borderRadius: 5,
    fontSize: 20,
    padding: 10,
  },
  errorText: {
    color: 'red',
    marginLeft: 10,
    marginTop: -5,
    fontSize: 14,
  },
});
