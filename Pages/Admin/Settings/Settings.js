import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import DeepNavLink from "../../../components/header/DeepNavLinks/DeepNavLinks";
import Container from "../../../components/Container/Container";
import { useState, useEffect } from "react";
import { useFetch } from "../../../_helpers/useFetch";
import platformAlert from "../../../_helpers/useAlert";

export default function Settings({ navigation, route }) {
  const [crons, setCrons] = useState([]);
  const [loading, setLoading] = useState(false);
  const cFetch = useFetch();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const res = await cFetch
      .get(`${process.env.EXPO_PUBLIC_BACKEND_API}/api/settings?key=schedule`)
      .catch((err) => console.log("Error fetching settings:", err));

    if (res && res.crons) {
      setCrons(res.crons);
    }
  };

  const updateCron = (index, value) => {
    const updated = [...crons];
    updated[index] = value;
    setCrons(updated);
  };

  const removeCron = (index) => {
    setCrons(crons.filter((_, i) => i !== index));
  };

  const addCron = () => {
    setCrons([...crons, ""]);
  };

  const saveSettings = async () => {
    const trimmed = crons.map((c) => c.trim()).filter(Boolean);
    if (trimmed.length === 0) {
      return platformAlert("Invalid", "At least one cron expression is required");
    }
    setLoading(true);
    const res = await cFetch
      .post(`${process.env.EXPO_PUBLIC_BACKEND_API}/api/settings`, {
        _id: "schedule",
        crons: trimmed,
      })
      .catch((err) => {
        console.log("Error saving settings:", err);
        return null;
      });
    setLoading(false);

    if (res && res.ok) {
      platformAlert("Saved", "Schedule settings updated successfully");
      setCrons(trimmed);
    } else {
      platformAlert("Error", "Failed to save settings");
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.cronRow}>
      <TextInput
        style={styles.cronInput}
        value={item}
        onChangeText={(val) => updateCron(index, val)}
        placeholder="e.g. 30 8 * * 1-5"
        placeholderTextColor="#999"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.removeBtn} onPress={() => removeCron(index)}>
        <Text style={styles.removeBtnText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <DeepNavLink route={route} navigation={navigation} routes={["Dashboard"]} />
      <Container>
        <View style={styles.mainContainer}>
          <Text style={styles.pageTitle}>Schedule Settings</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cron Expressions ({crons.length})</Text>
            <Text style={styles.hint}>
              Each cron sets a day-of-week window and update time.{"\n"}
              Example: "30 8 * * 1-5" = 8:30 AM Mon–Fri
            </Text>
            <FlatList
              data={crons}
              renderItem={renderItem}
              keyExtractor={(_, i) => String(i)}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No cron expressions defined</Text>
              }
              scrollEnabled={false}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addCron}>
              <Text style={styles.addBtnText}>+ Add Cron</Text>
            </TouchableOpacity>
          </View>

          <Button
            title={loading ? "Saving..." : "Save Settings"}
            color="#3b78a1"
            onPress={saveSettings}
            disabled={loading}
          />
        </View>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3b78a1",
    textAlign: "center",
    marginBottom: 24,
  },
  section: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: "#6c757d",
    marginBottom: 16,
    lineHeight: 18,
  },
  cronRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  cronInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: "#fff",
    color: "#495057",
  },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#dc3545",
    borderRadius: 8,
  },
  removeBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  addBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3b78a1",
    borderStyle: "dashed",
  },
  addBtnText: {
    color: "#3b78a1",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyText: {
    color: "#adb5bd",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
});
