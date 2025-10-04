import { View, Text, TextInput, StyleSheet, Button, Alert } from "react-native";
import { set, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Container from "../../components/Container/Container";
import LoginSchema from "../../_helpers/Schemas/LoginSchema";

import CustomTextInput from "../../components/Forms/CTextInput";
import { useEffect, useState } from "react";

import { useFetch } from "../../_helpers/useFetch";

import { useAtom } from "jotai";
import { authAtom } from "../../_helpers/Atoms";
import useAlert from "../../_helpers/useAlert";


export default function Login({ navigation }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(LoginSchema),
  });

  const cFetch = useFetch();
  const [auth, setAuth] = useAtom(authAtom);
  const [loading, setLoading] = useState(false);

  useEffect(
    () => console.log("backend api at: ", process.env.EXPO_PUBLIC_BACKEND_API),
    []
  );

  const onSubmit = async (data) => {
    setLoading(true);
    console.log("Api at: ", process.env.EXPO_PUBLIC_BACKEND_API)
    const res = await cFetch
      .post(`${process.env.EXPO_PUBLIC_BACKEND_API}/api/auth`, data)
      .catch((err) => {
        console.error("Error on login: ", err);
        useAlert("Error", "An error occured while trying to log in");
        return setLoading(false);
      });

    console.log("login in: ", res);
    setLoading(false);

    if (res.code === "noUser")
      return useAlert(
        "User not found",
        "Please check your credentials and contact the administrator"
      );
    else if (res.code === "badPass")
      return useAlert(
        "Incorrect password",
        "If you forgot the password, contact the administrator"
      );

    setAuth(res);

    navigation.navigate("Home");
  };

  return (
    <Container>
      <CustomTextInput
        control={control}
        name={"username"}
        placeholder={"username"}
        label={"username"}
        errors={errors}
      />

      <CustomTextInput
        control={control}
        name={"password"}
        placeholder={"password"}
        label={"password"}
        errors={errors}
      />

      <View style={styles.buttonContainer}>
        <Button
          disabled={loading}
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
          title="Log in"
          color="#3b78a1"
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 50,
    width: "100%",
    margin: "auto",
  },

  buttonContainer: {
    margin: 10,
  },
});
