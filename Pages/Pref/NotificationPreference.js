import { StyleSheet, View, Dimensions, Text, Button } from "react-native";
import DeepNavLink from "../../components/header/DeepNavLinks/DeepNavLinks";
import Container from "../../components/Container/Container";

import { useAtom } from "jotai";
import { authAtom } from "../../_helpers/Atoms";
import Loader from "../../components/Loader/Loader";
import { useEffect, useState } from "react";
import { useFetch } from "../../_helpers/useFetch";
import { set } from "react-hook-form";

import Checkbox from "expo-checkbox";

import platformAlert from "../../_helpers/useAlert";

export default function NotificationPreferences({ navigation, route }) {
  const cFetch = useFetch();
  const [loading, setLoading] = useState(false);
  const [emailPref, setEmailPref] = useState(1);
  const [persistMeals, setPersistMeals] = useState(false);
  const [skipNotSignedUp, setSkipNotSignedUp] = useState(false);
  const [allowNextWeek, setAllowNextWeek] = useState(false);
  const [name, setName] = useState("");
  const [auth, setAuth] = useAtom(authAtom);

  useEffect(() => {
    loadPreferences();
  }, [route]);

  const loadPreferences = async () => {
    setLoading(true);
    const res = await cFetch.get(
      `${process.env.EXPO_PUBLIC_BACKEND_API}/api/preferences`,
      null,
      {
        user_id: route.params.forUser,
      }
    );
    console.log("Preferences: ", res, route.params.forUser);
    setEmailPref(res.preferences.email);
    setPersistMeals(res.preferences.persistMeals);
    setAllowNextWeek(res.preferences.allowNextWeek);
    setSkipNotSignedUp(res.preferences.skipNotSignedUp);
    setName(res.firstName);
    setLoading(false);
  };

  const savePreferences = async () => {
    setLoading(true);

    const preferences = await cFetch.post(
      `${process.env.EXPO_PUBLIC_BACKEND_API}/api/preferences`,
      {
        email: emailPref,
        persistMeals: persistMeals,
        allowNextWeek: allowNextWeek,
        skipNotSignedUp: skipNotSignedUp,
      },
      {
        user_id: route.params.forUser,
      }
    );
    setLoading(false);
    navigation.navigate(route.params.returnPaths[route.params.returnPaths.length - 1]);
    platformAlert("Success", "Preferences saved");

    //setAuth((oldP) => ({ ...oldP, allowNextWeek: allowNextWeek }));
  };

  return (
    <View>
      <DeepNavLink routes={route.params.returnPaths} navigation={navigation} />

      <Container>
        <Loader loading={loading}>
          {route.params.forUser && !loading && (
            <Text style={{ fontSize: 30, color: "#3b78a1" }}>
            {name}'s Notification Preferences
          </Text>
          )}
          <Text style={styles.optionGroupLabel}>Email Preferences:</Text>
          <View style={styles.singleOptionContainer}>
            
            <Checkbox
            style={styles.checkbox}
              onValueChange={() => setEmailPref(0)}
              value={emailPref == 0}
            />
            <Text style={styles.singleOptionTextLabel}>No emails</Text>
          </View>
          <View style={styles.singleOptionContainer}>
            
            <Checkbox
              style={styles.checkbox}
              onValueChange={() => setEmailPref(1)}
              value={emailPref == 1}
            />
            <Text style={styles.singleOptionTextLabel}>Only email if not meals marked:</Text>
          </View>
          <View style={styles.singleOptionContainer}>
            
            <Checkbox
              style={styles.checkbox}
              onValueChange={() => setEmailPref(2)}
              value={emailPref == 2}
            />
            <Text style={styles.singleOptionTextLabel}>Daily meal report:</Text>
          </View>

          <Text style={styles.optionGroupLabel}>Usage Preferences:</Text>
            <View style={styles.singleOptionContainer}>
                        
                <Checkbox
                  style={styles.checkbox}
                  onValueChange={() => setAllowNextWeek(!allowNextWeek)}
                  value={allowNextWeek}
                />
                <Text style={styles.singleOptionTextLabel}>Allow mark next week:</Text>
              </View>

          {route.params.forUser && !loading && (
            <>
            <Text style={styles.optionGroupLabel}>Admin Preferences:</Text>
            <View style={styles.singleOptionContainer}>
                        
                <Checkbox
                  style={styles.checkbox}
                  onValueChange={() => setPersistMeals(!persistMeals)}
                  value={persistMeals}
                />
                
                <Text style={styles.singleOptionTextLabel}>Persist Meals:</Text>
              </View>

              <View style={styles.singleOptionContainer}>
                        
                <Checkbox
                  style={styles.checkbox}
                  onValueChange={() => setSkipNotSignedUp(!skipNotSignedUp)}
                  value={skipNotSignedUp}
                />
                
                <Text style={styles.singleOptionTextLabel}>Do not include in "Not signed up" for meals:</Text>
              </View>
            </>
            

            
          )}
          <View>
            <Button title="Save" onPress={savePreferences} />
          </View>
        </Loader>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  singleOptionContainer: {
    flexDirection: "row",
    marginVertical: "0.5em",
    marginHorizontal: "0",
  },
  singleOptionTextLabel: {
    fontSize: 18,
    marginLeft: "0.5em"
  },
  checkbox: {
    height: 18,
    width: 18,
  },
  optionGroupLabel: {
    fontSize: 30,
    textDecorationLine: "underline",
    color: "#3b78a1",
  }
});
