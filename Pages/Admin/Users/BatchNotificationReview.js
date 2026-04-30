import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Container from "../../../components/Container/Container";
import DeepNavLink from "../../../components/header/DeepNavLinks/DeepNavLinks";
import Loader from "../../../components/Loader/Loader";
import { useFetch } from "../../../_helpers/useFetch";
import platformAlert, { platformConfirm } from "../../../_helpers/useAlert";
import {
  buildNotificationSummarySections,
  getEnabledBatchSectionLabels,
} from "../../Pref/notificationPreferencesUtils";
import { useState } from "react";

export default function BatchNotificationReview({ navigation, route }) {
  const cFetch = useFetch();
  const [loading, setLoading] = useState(false);

  const selectedUsers = route.params?.selectedUserSummaries || [];
  const notificationPreferences = route.params?.notificationPreferences;
  const sectionsToModify = route.params?.sectionsToModify || {};
  const enabledSectionLabels = getEnabledBatchSectionLabels(sectionsToModify);
  const summarySections = buildNotificationSummarySections(notificationPreferences).filter(
    (section) => sectionsToModify[section.key]
  );

  const applyChanges = async () => {
    const confirmed = await platformConfirm(
      "Apply Notification Preferences",
      `Apply these notification preferences to ${selectedUsers.length} selected users?`,
      { confirmText: "Apply", cancelText: "Cancel" }
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      const response = await cFetch.post(
        `${process.env.EXPO_PUBLIC_BACKEND_API}/api/users/batch/notifications`,
        {
          userIds: route.params.selectedUserIds,
          notificationPreferences,
          sectionsToModify,
        }
      );

      navigation.navigate("Users List", {
        batchNotificationResult: response,
      });
    } catch (error) {
      platformAlert("Error", error?.message || error || "Failed to apply notification preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DeepNavLink navigation={navigation} routes={route.params.returnPaths} />
      <Container>
        <Loader loading={loading}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.pageHeader}>Review Batch Notification Update</Text>
            <Text style={styles.subHeader}>
              {selectedUsers.length} user{selectedUsers.length === 1 ? "" : "s"} will have only the selected sections updated.
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Selected Users</Text>
              {selectedUsers.map((user) => (
                <View key={user.id} style={styles.userRow}>
                  <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
                  <Text style={styles.userEmail}>{user.email || "No email on file"}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sections Being Modified</Text>
              {enabledSectionLabels.map((label) => (
                <Text key={label} style={styles.sectionLabel}>{label}</Text>
              ))}
            </View>

            {summarySections.map((section) => (
              <View key={section.title} style={styles.card}>
                <Text style={styles.cardTitle}>{section.title}</Text>
                {section.rows.map(([label, value]) => (
                  <View key={label} style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{label}</Text>
                    <Text style={styles.summaryValue}>{value}</Text>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={applyChanges}
              >
                <Text style={styles.buttonText}>Confirm And Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Loader>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  pageHeader: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#3b78a1",
    marginBottom: 10,
  },
  subHeader: {
    textAlign: "center",
    color: "#444",
    marginBottom: 20,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8e3ed",
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3b78a1",
    marginBottom: 12,
  },
  userRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eef3f7",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  userEmail: {
    color: "#666",
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  summaryRow: {
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  summaryValue: {
    color: "#666",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
