import { Controller } from "react-hook-form";
import { View, Text, TextInput, StyleSheet } from "react-native";

import { Picker } from "@react-native-picker/picker";
import { useFetch } from "../_helpers/useFetch";
import { useEffect, useState } from "react";

export default function CTextInput({
  control,
  name,
  requestURL,
  label,
  errors,
  defaultValue,
}) {
  const cFetch = useFetch();

  const [options, setOptions] = useState([defaultValue]);

  useEffect(() => {
    getOptions();
  }, []);

  const getOptions = async () => {
    const res = await cFetch.get(requestURL);
    if (res.message == "OK") {
      const dietItems = res.data.map((item) => item.name);
      setOptions([defaultValue, ...dietItems]);
    }
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        defaultValue={defaultValue}
        render={({ field: { onChange, value } }) => (
          <>
            <Picker
              selectedValue={value}
              onValueChange={(itemValue, itemIndex) => onChange(itemValue)}
            >
              {options.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </>
        )}
        name={name}
      />

      {errors[name] && <Text>{errors[name].message}</Text>}
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
});
