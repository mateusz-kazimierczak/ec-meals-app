import { StyleSheet, View, Text } from "react-native";
import DeepNavLink from "../../components/header/DeepNavLinks/DeepNavLinks";
import Container from "../../components/Container/Container";
import Loader from "../../components/Loader/Loader";
import { useState, useEffect } from "react";
import { useFetch } from "../../_helpers/useFetch";
import Checkbox from "expo-checkbox"; // Ensure the correct import for Checkbox

export default function GeneralPreferences({ navigation, route }) {
  const cFetch = useFetch();
  const [loading, setLoading] = useState(false);
  const [allowNextWeek, setAllowNextWeek] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    const res = await cFetch.get(
      `${process.env.EXPO_PUBLIC_BACKEND_API}/api/preferences`,
      null,
      {
        user_id: route.params.forUser,
      }
    );
    setAllowNextWeek(res.preferences.allowNextWeek);
    setLoading(false);
  };

  const savePreferences = async () => {
    setLoading(true);
    await cFetch.post(
      `${process.env.EXPO_PUBLIC_BACKEND_API}/api/preferences`,
      {
        allowNextWeek,
      },
      {
        user_id: route.params.forUser,
      }
    );
    setLoading(false);
    navigation.navigate(route.params.returnPaths[route.params.returnPaths.length - 1]);
  };

  return (
    <>
      <DeepNavLink routes={route.params.returnPaths} navigation={navigation} />
      <Container>
        <Loader loading={loading}>
          <Text style={styles.pageHeader}>General Preferences</Text>
          <View style={styles.singleOptionContainer}>
            <Checkbox
              style={styles.checkbox}
              onValueChange={() => setAllowNextWeek(!allowNextWeek)}
              value={allowNextWeek}
            />
            <Text style={styles.singleOptionTextLabel}>Allow mark next week</Text>
          </View>
          <View>
            <Text style={styles.saveButton} onPress={savePreferences}>
              Save Preferences
            </Text>
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
  singleOptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  singleOptionTextLabel: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
  },
  checkbox: {
    height: 20,
    width: 20,
  },
  saveButton: {
    fontSize: 18,
    color: "#007AFF",
    textAlign: "center",
    marginTop: 20,
    textDecorationLine: "underline",
  },
});
