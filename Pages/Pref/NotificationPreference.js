import { StyleSheet, View, Dimensions, Text, Button, TouchableOpacity } from "react-native";
import DeepNavLink from "../../components/header/DeepNavLinks/DeepNavLinks";
import Container from "../../components/Container/Container";
import Loader from "../../components/Loader/Loader";
import { useEffect, useState } from "react";
import { useFetch } from "../../_helpers/useFetch";
import { DaysOfTheWeek, screeenWidth } from "../../Pages/Meals/common";

import { useAtom } from "jotai";
import { authAtom } from "../../_helpers/Atoms";

import Checkbox from "../../components/Forms/Checkbox"; // Import the Checkbox component
import GroupCheckboxTable from "../../components/Forms/GroupCheckboxTable"; // Import the reusable component

import platformAlert from "../../_helpers/useAlert";

const generateNotificationSchema = (userSchema) => ({
  full_report: {
    title: "Full Report",
    values: userSchema.full_report || Array(7).fill(false),
    group: 1,
  },
  meals: {
    title: "Normal Meals",
    values: userSchema.meals || Array(7).fill(false),
    group: 2,
  },
  packed_meals: {
    title: "Packed Meals",
    values: userSchema.packed_meals || Array(7).fill(false),
    group: 2,
  },
  any_meals: {
    title: "Any Meals",
    values: userSchema.any_meals || Array(7).fill(false),
    group: 3,
  }
});

const generateNotificationSchedule = (userSchedule) => ({
  morning: {
    title: "Morning",
    values: userSchedule.morning || Array(7).fill(false),
    group: 1,
  },
  noon: {
    title: "Noon",
    values: userSchedule.noon || Array(7).fill(false),
    group: 1,
  },
  evening: {
    title: "Evening",
    values: userSchedule.evening || Array(7).fill(false),
    group: 1,
  }
});

export default function NotificationPreferences({ navigation, route }) {
  const cFetch = useFetch();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [auth, setAuth] = useAtom(authAtom);

  const [notificationSchema, setNotificationSchema] = useState(generateNotificationSchema({}));
  const [notificationSchedule, setNotificationSchedule] = useState(generateNotificationSchedule({}));

  const [notificationTypes, setNotificationTypes] = useState({
    email: false,
  });



  useEffect(() => {
    loadPreferences();
  }, [route]);

  const loadPreferences = async () => {
    setLoading(true);
    const res = await cFetch.get(
      `${process.env.EXPO_PUBLIC_BACKEND_API}/api/preferences/notifications`,
      null,
      {
        user_id: route.params.forUser,
      }
    );

    user_notifications = 

    // Initialize notification schema and schedule with existing preferences
    setNotificationSchema(generateNotificationSchema(res.notifications.schema || {}));

    setNotificationSchedule(generateNotificationSchedule(res.notifications.schedule || {}));
    
    setNotificationTypes({
      email: res.notifications.notificationTypes.email || false,
    });

    setName(res.firstName);
    setLoading(false);
  };

  const savePreferences = async () => {
    setLoading(true);
    
    // Only care about the values, return in form {key: values}
    schema = Object.fromEntries(
      Object.entries(notificationSchema).map(([key, value]) => [key, value.values])
    );
    schedule = Object.fromEntries(
      Object.entries(notificationSchedule).map(([key, value]) => [key, value.values])
    );
    
    console.log("Saving preferences:", { schema, schedule, notificationTypes });

    await cFetch.post(
      `${process.env.EXPO_PUBLIC_BACKEND_API}/api/preferences/notifications`,
      {
        schema,
        schedule,
        notificationTypes,
      },
      {
        user_id: route.params.forUser,
      }
    );
    setLoading(false);
    navigation.navigate(route.params.returnPaths[route.params.returnPaths.length - 1]);
    platformAlert("Success", "Notification preferences saved");
  };

  return (
    <>
      <DeepNavLink routes={route.params.returnPaths} navigation={navigation} />
      <Container>
        <Loader loading={loading}>
          {route.params.forUser && !loading && (
            <Text style={{ fontSize: 30, color: "#3b78a1" }}>
              {name}'s Notification Preferences
            </Text>
          )}
          <Text style={styles.pageHeader}>Notification Preferences</Text>
          <View style={styles.tableContainer}>

            <Text style={styles.pageHeader}>Notification Types</Text>

            <View>
              <Checkbox
                label={"Email"}
                value={notificationTypes.email}
                setValue={(value) => setNotificationTypes({ ...notificationTypes, email: value })}
              />  
            </View>


            <Text style={styles.pageHeader}>Notification Schema</Text>

            <GroupCheckboxTable
              data={notificationSchema}
              setData={(newData) => setNotificationSchema(newData)} />

            <Text style={styles.pageHeader}>Notification Schedule</Text>

            <GroupCheckboxTable
              data={notificationSchedule}
              setData={(newData) => setNotificationSchedule(newData)} />
            
          </View>
          <View>
            <Button title="Save" onPress={savePreferences} />
          </View>
        </Loader>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#3b78a1",
  },
  tableContainer: {
    marginVertical: 20,
  },
  head: {
    height: 40,
    backgroundColor: "#f1f8ff",
  },
  commonRow: {
    height: 50,
  },
  text: {
    margin: 6,
    textAlign: "center",
  },
  headerText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  checkbox: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    alignSelf: "center",
    justifyContent: "center",
  },
  selectedCheckbox: {
    backgroundColor: "#007AFF",
  },
  deselectedCheckbox: {
    backgroundColor: "white",
  },
});
