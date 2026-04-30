import Container from "../../../components/Container/Container";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import DeepNavLink from "../../../components/header/DeepNavLinks/DeepNavLinks";


import { useFetch } from "../../../_helpers/useFetch";
import { useEffect, useState } from "react";

import Loader from "../../../components/Loader/Loader";
import { useIsFocused } from "@react-navigation/native";
import Checkbox from "../../../components/Forms/Checkbox";
import platformAlert from "../../../_helpers/useAlert";

export default function Users({ navigation, route }) {
  const cFetch = useFetch();

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const isFocused = useIsFocused();

  const getUsers = async () => {
    setLoading(true);
    const users = await cFetch.get(
      `${process.env.EXPO_PUBLIC_BACKEND_API}/api/users/all`
    );
    if (users) setUsers(users);
    setLoading(false);
  };

  useEffect(() => {
    getUsers();
  }, [isFocused]);

  useEffect(() => {
    const result = route.params?.batchNotificationResult;
    if (!result) {
      return;
    }

    setSelectedUserIds([]);
    platformAlert(
      "Success",
      `Updated notification preferences for ${result.updatedCount} user${result.updatedCount === 1 ? "" : "s"}.`
    );
    navigation.setParams({ batchNotificationResult: undefined });
  }, [route.params?.batchNotificationResult]);

  const filteredUsers = users.filter((user) =>
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleUserIds = filteredUsers.map((user) => user.id);
  const allVisibleSelected =
    visibleUserIds.length > 0 &&
    visibleUserIds.every((id) => selectedUserIds.includes(id));

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const selectAllVisible = () => {
    setSelectedUserIds((prevSelected) => {
      const nextSelection = new Set(prevSelected);
      visibleUserIds.forEach((id) => nextSelection.add(id));
      return Array.from(nextSelection);
    });
  };

  const clearSelection = () => {
    setSelectedUserIds([]);
  };

  const selectedUserSummaries = users.filter((user) => selectedUserIds.includes(user.id));

  const startBatchNotificationEdit = () => {
    navigation.navigate("Batch Notification Preferences", {
      isBatchEdit: true,
      selectedUserIds,
      selectedUserSummaries,
      returnPaths: ["Dashboard", "Users List"],
    });
  };

  return (
    <>
      <DeepNavLink
        route={route}
        navigation={navigation}
        routes={["Dashboard"]}
      />
      <Container style={styles.outerContainerStyles}>
        <View style={styles.headerContainer}>
          <Text style={styles.pageHeader}>Users</Text>
          <TouchableOpacity
            style={styles.addUserButton}
            onPress={() =>
              navigation.navigate("Modify User", {
                returnPaths: ["Dashboard", "Users List"],
              })
            }
          >
            <Text style={styles.addUserButtonText}>Add User</Text>
          </TouchableOpacity>
          
        </View>
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Search by first name:</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchField}
            placeholder="Enter first name..."
          />
        </View>
        <View style={styles.batchActionsContainer}>
          <Text style={styles.selectionSummary}>
            {selectedUserIds.length} user{selectedUserIds.length === 1 ? "" : "s"} selected
          </Text>
          <View style={styles.selectionButtons}>
            <TouchableOpacity
              style={[
                styles.selectionActionButton,
                allVisibleSelected ? styles.selectionActionButtonDisabled : styles.selectionActionButtonPrimary,
              ]}
              onPress={selectAllVisible}
              disabled={allVisibleSelected || visibleUserIds.length === 0}
            >
              <Text style={styles.selectionActionText}>Select All Visible</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.selectionActionButton,
                selectedUserIds.length === 0 ? styles.selectionActionButtonDisabled : styles.selectionActionButtonSecondary,
              ]}
              onPress={clearSelection}
              disabled={selectedUserIds.length === 0}
            >
              <Text style={styles.selectionActionText}>Clear Selection</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[
              styles.batchEditButton,
              selectedUserIds.length === 0 && styles.batchEditButtonDisabled,
            ]}
            onPress={startBatchNotificationEdit}
            disabled={selectedUserIds.length === 0}
          >
            <Text style={styles.batchEditButtonText}>Apply Notification Preferences</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.usersListContainer}>
          <Loader loading={loading}>
            <>
              {filteredUsers.map((user) => (
                  <View key={user.id} style={styles.singleUserContainer}>
                    <Checkbox
                      label=""
                      value={selectedUserIds.includes(user.id)}
                      setValue={() => toggleUserSelection(user.id)}
                      style={styles.rowCheckboxContainer}
                      checkboxStyle={styles.rowCheckbox}
                    />
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={[styles.button, styles.mealsButton]}
                        onPress={() =>
                          navigation.navigate("IdMeals", {
                            user_id: user.id,
                            returnPaths: ["Dashboard", "Users List"],
                          })
                        }
                      >
                        <Text style={styles.buttonText}>Meals</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.editButton]}
                        onPress={() =>
                          navigation.navigate("Modify User", {
                            user_id: user.id,
                            returnPaths: ["Dashboard", "Users List"],
                          })
                        }
                      >
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </>
          </Loader>
        </View>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  pageHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b78a1",
  },
  searchContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  searchLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  searchField: {
    width: "100%",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  batchActionsContainer: {
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  selectionSummary: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    fontWeight: "600",
  },
  selectionButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  selectionActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  selectionActionButtonPrimary: {
    backgroundColor: "#007AFF",
  },
  selectionActionButtonSecondary: {
    backgroundColor: "#6c757d",
  },
  selectionActionButtonDisabled: {
    backgroundColor: "#b7c4d1",
  },
  selectionActionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  batchEditButton: {
    backgroundColor: "#3b78a1",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  batchEditButtonDisabled: {
    backgroundColor: "#b7c4d1",
  },
  batchEditButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  usersListContainer: {
    marginTop: 10,
  },
  rowCheckboxContainer: {
    marginRight: 10,
    marginVertical: 0,
    paddingVertical: 0,
  },
  rowCheckbox: {
    marginRight: 0,
  },
  singleUserContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  mealsButton: {
    backgroundColor: "#007AFF",
  },
  editButton: {
    backgroundColor: "#34C759",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  addUserButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addUserButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
