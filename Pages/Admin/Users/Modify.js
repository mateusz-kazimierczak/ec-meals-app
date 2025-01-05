import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
} from "react-native";

import Container from "../../../components/Container/Container";
import Loader from "../../../components/Loader/Loader";
import DeepNavLink from "../../../components/header/DeepNavLinks/DeepNavLinks";
import CustomTextInput from "../../../components/Forms/CTextInput";
import SelectInput from "../../../components/Forms/SelectInput";
import RCSelectInput from "../../../components/RequestSelectInput";
import CheckBoxInput from "../../../components/Forms/CheckboxInput";

import { useAtom } from "jotai";
import { authAtom } from "../../../_helpers/Atoms";

import { set, useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";

import ModifySchema from "../../../_helpers/Schemas/ModifySchema";
import AddSchema from "../../../_helpers/Schemas/AddSchema";

import { useFetch } from "../../../_helpers/useFetch";

import { useEffect, useState } from "react";
import platformAlert from "../../../_helpers/useAlert";

export default function ModifyUser({ navigation, route }) {
  const [auth, setAuth] = useAtom(authAtom);
  const [loading, setLoading] = useState(false);

  const cFetch = useFetch();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {

    // check if user is being modified or a new user is being created
    if (route.params?.user_id || route.params?.token) {
      // User is being modified, fetch user data from DB
      setLoading(true);
      const res = await cFetch.get(
        `${process.env.EXPO_PUBLIC_BACKEND_API}/api/users/single`,
        null,
        {
          user_id: route.params.user_id,
          token: route.params.token,
        }
      );
      reset({
        defaultUsername: false,
        username: res.username,
        firstName: res.firstName,
        lastName: res.lastName,
        email: res.email,
        room: res.room,
        role: res.role,
        active: res.active,
        guest: res.guest,
        diet: res.diet,
        birthday: `${res.birthdayDay}/${res.birthdayMonth}`
      });
      setLoading(false);
    }
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: joiResolver(
      route.params?.user_id || route.params?.token ? ModifySchema : AddSchema
    ),
  });

  const email = watch("email", false);

  const defaultUsername = watch("defaultUsername", true);

  const onSubmit = async (data) => {
    data = submitDataCleanup(data);
    console.log("submit data: ", data);
    setLoading(true);
    if (route.params?.user_id || route.params?.token) {
      try {
        await cFetch.patch(
          `${process.env.EXPO_PUBLIC_BACKEND_API}/api/users/single`,
          data,
          {
            user_id: route.params.user_id,
            token: route.params.token,
          }
        );
      } catch {
        platformAlert("Error", "Error updating user");
        setLoading(false);
        return;
      }
    } else {
      try {
        await cFetch.post(
          `${process.env.EXPO_PUBLIC_BACKEND_API}/api/users/single`,
          data
        );
      } catch {
        platformAlert("Error", "Error adding user");
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    platformAlert(
      "Success",
      route.params?.user_id || route.params?.token
        ? "User Updated"
        : "User Added"
    );
    navigation.navigate(
      route.params?.token ? "Preferences Dashboard" : "Users List"
    );
  };

  const removeUser = async () => {
    setLoading(true);
    await cFetch.delete(
      `${process.env.EXPO_PUBLIC_BACKEND_API}/api/users/single`,
      null,
      {
        user_id: route.params.user_id,
        token: route.params.token,
      }
    );
    setLoading(false);
    platformAlert("Success", "User Removed");
    navigation.navigate("Users List");
  };

  const confirmRemoveUser = () => {
    if (Platform.OS == "web") {
      if (
        confirm(
          "Are you sure you want to remove the user? This action cannot be undone."
        )
      ) {
        removeUser();
      }
    } else {
      Alert.alert(
        "Confirm Delete User",
        "Are you sure you want to remove the user? This action cannot be undone.",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          { text: "OK", onPress: () => removeUser() },
        ]
      );
    }
  };

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  return (
    <View style={{ height: "100%" }}>
      {route.params?.returnPaths && (
        <DeepNavLink
          routes={route.params.returnPaths}
          navigation={navigation}
        />
      )}
      <Container>
        <Loader loading={loading}>
          <View style={styles.scrollContainer}>
            <CheckBoxInput
              control={control}
              name={"defaultUsername"}
              label={"Default username (firstname_lastname)"}
              errors={errors}
              defaultValue={true}
            />

            {!defaultUsername && (
              <CustomTextInput
                control={control}
                name={"username"}
                placeholder={"username"}
                label={"username"}
                errors={errors}
              />
            )}

            <CustomTextInput
              control={control}
              name={"email"}
              placeholder={"Email"}
              label={"Email"}
              errors={errors}
            />

            <CustomTextInput
              control={control}
              name={"birthday"}
              placeholder={"Day/Month"}
              label={"Date of birth (leave blank to hide)"}
              errors={errors}
            />

            {!(route.params?.user_id || route.params?.token) && email && (
              <CheckBoxInput
                control={control}
                name={"sendWelcomeEmail"}
                label={"Send Welcome Email"}
                errors={errors}
              />
            )}

            <CustomTextInput
              control={control}
              name={"password"}
              placeholder={"password"}
              label={"password"}
              errors={errors}
            />

            {auth.role === "admin" && (
              <>
                <CustomTextInput
                  control={control}
                  name={"lastName"}
                  placeholder={"Last Name"}
                  label={"Last Name"}
                  errors={errors}
                />

                <CustomTextInput
                  control={control}
                  name={"firstName"}
                  placeholder={"First Name"}
                  label={"First Name"}
                  errors={errors}
                />

                <CustomTextInput
                  control={control}
                  name={"room"}
                  placeholder={"Room"}
                  label={"Room"}
                  errors={errors}
                  keyboardType={"numeric"}
                />

                <SelectInput
                  control={control}
                  name={"role"}
                  label={"Role"}
                  errors={errors}
                  options={[
                    { label: "Student", value: "student" },
                    { label: "Admin", value: "admin" },
                    { label: "Numerary", value: "numerary" },
                  ]}
                />

                <RCSelectInput
                  control={control}
                  name={"diet"}
                  label={"Diet"}
                  errors={errors}
                  defaultValue={"None"}
                  requestURL={`${process.env.EXPO_PUBLIC_BACKEND_API}/api/diets`}
                />



                <CheckBoxInput
                  control={control}
                  name={"active"}
                  label={"active"}
                  errors={errors}
                  defaultValue={true}
                />

                <CheckBoxInput
                  control={control}
                  name={"guest"}
                  label={"guest"}
                  errors={errors}
                />
              </>
            )}

            <View style={styles.buttonContainer}>
              <Button
                onPress={handleSubmit(onSubmit)}
                style={styles.button}
                title={
                  route.params?.user_id || route.params?.token
                    ? "Update User"
                    : "Add User"
                }
                color="#3b78a1"
              />
              {auth.role === "admin" && route.params?.user_id && (
               <>
                <Button
                  onPress={confirmRemoveUser}
                  style={styles.button}
                  title={"Remove User"}
                  color="red"
                />
                <Button
                  onPress={() =>
                    navigation.navigate("Admin Notification Preferences", { returnPaths: ["Dashbaord", "Users List"], forUser: route.params.user_id })
                  }
                  style={styles.button}
                  title={"Set Preferences"}
                  color="#3b78a1"
                />
                </>
              )}
            </View>
          </View>
        </Loader>
      </Container>
    </View>
  );
}

const submitDataCleanup = (data) => {
  if (data.diet == "None") {
    data.diet = undefined;
  }
  if (data.defaultUsername) {
    data.username = `${data.firstName}_${data.lastName}`;
  }
  return data;
};

const styles = StyleSheet.create({
  header: {
    fontSize: 50,
    width: "100%",
    margin: "auto",
  },
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
  buttonContainer: {
    margin: 10,
    marginBottom: 50,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
