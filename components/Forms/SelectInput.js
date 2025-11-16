import { Controller } from "react-hook-form";
import { View, Text, TextInput, StyleSheet } from "react-native";

import { Picker } from "@react-native-picker/picker";

export default function CTextInput({
  control,
  name,
  options,
  label,
  errors,
  defaultValue,
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        defaultValue={defaultValue || options[0].value}
        render={({ field: { onChange, value } }) => (
          <>
            <Picker
              selectedValue={value}
              onValueChange={(itemValue, itemIndex) => onChange(itemValue)}
            >
              {options.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </>
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
