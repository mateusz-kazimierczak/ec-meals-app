import { StyleSheet, View, Dimensions, Text, Button, TouchableOpacity } from "react-native";
import DeepNavLink from "../../components/header/DeepNavLinks/DeepNavLinks";
import Container from "../../components/Container/Container";
import Loader from "../../components/Loader/Loader";
import { useEffect, useState } from "react";
import { useFetch } from "../../_helpers/useFetch";

import { useAtom } from "jotai";
import { authAtom } from "../../_helpers/Atoms";

import Checkbox from "../../components/Forms/Checkbox"; // Import the Checkbox component
import GroupCheckboxTable from "../../components/Forms/GroupCheckboxTable"; // Import the reusable component

import platformAlert from "../../_helpers/useAlert";

import MobileNotificationRegister from "./MobileNotifications/MobileNotificationDevice";
import {
  batchNotificationSectionLabels,
  createBatchSectionsToModify,
  createInitialNotificationEditorState,
  defaultNotificationPreferences,
  serializeNotificationPreferences,
} from "./notificationPreferencesUtils";

export default function NotificationPreferences({ navigation, route }) {
  const cFetch = useFetch();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [auth] = useAtom(authAtom);
  const [device, setDevice] = useState(null);
  const [notificationSchema, setNotificationSchema] = useState(() => createInitialNotificationEditorState().notificationSchema);
  const [notificationSchedule, setNotificationSchedule] = useState(() => createInitialNotificationEditorState().notificationSchedule);
  const [reportSchema, setReportSchema] = useState(() => createInitialNotificationEditorState().reportSchema);
  const [notificationTypes, setNotificationTypes] = useState(() => createInitialNotificationEditorState().notificationTypes);
  const [batchSectionsToModify, setBatchSectionsToModify] = useState(() => createBatchSectionsToModify());

  const isBatchEdit = route.params?.isBatchEdit;

  useEffect(() => {
    loadPreferences();
  }, [route]);

  const loadPreferences = async () => {
    setLoading(true);

    if (isBatchEdit) {
      const initialState = createInitialNotificationEditorState(defaultNotificationPreferences);
      setNotificationSchema(initialState.notificationSchema);
      setNotificationSchedule(initialState.notificationSchedule);
      setReportSchema(initialState.reportSchema);
      setNotificationTypes(initialState.notificationTypes);
      setDevice(null);
      setBatchSectionsToModify(createBatchSectionsToModify());
      setName("");
      setLoading(false);
      return;
    }

    const res = await cFetch.get(
      `${process.env.EXPO_PUBLIC_BACKEND_API}/api/preferences/notifications`,
      null,
      {
        user_id: route.params.forUser,
      }
    );

    const initialState = createInitialNotificationEditorState(res.notifications || defaultNotificationPreferences);
    setNotificationSchema(initialState.notificationSchema);
    setNotificationSchedule(initialState.notificationSchedule);
    setReportSchema(initialState.reportSchema);
    setNotificationTypes(initialState.notificationTypes);
    setDevice(res.notifications?.device || null);

    setName(res.firstName);
    setLoading(false);
  };

  const savePreferences = async () => {
    setLoading(true);

    if (isBatchEdit && !Object.values(batchSectionsToModify).some(Boolean)) {
      setLoading(false);
      platformAlert("Choose Sections", "Select at least one section to modify before continuing.");
      return;
    }

    const notificationPreferences = serializeNotificationPreferences({
      notificationSchema,
      notificationSchedule,
      reportSchema,
      notificationTypes,
      device,
    });

    console.log("Saving preferences:", notificationPreferences);

    if (isBatchEdit) {
      setLoading(false);
      navigation.navigate("Batch Notification Review", {
        notificationPreferences: {
          ...notificationPreferences,
          device: null,
        },
        selectedUserIds: route.params.selectedUserIds,
        selectedUserSummaries: route.params.selectedUserSummaries,
        sectionsToModify: batchSectionsToModify,
        returnPaths: route.params.returnPaths,
      });
      return;
    }

    await cFetch.post(
      `${process.env.EXPO_PUBLIC_BACKEND_API}/api/preferences/notifications`,
      notificationPreferences,
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
          {isBatchEdit && !loading && (
            <Text style={{ fontSize: 24, color: "#3b78a1", textAlign: "center" }}>
              Batch Notification Preferences For {route.params.selectedUserIds.length} Users
            </Text>
          )}
          {route.params.forUser && !loading && !isBatchEdit && (
            <Text style={{ fontSize: 30, color: "#3b78a1" }}>
              {name}'s Notification Preferences
            </Text>
          )}
          <Text style={styles.pageHeader}>Notification Preferences</Text>
          <View style={styles.tableContainer}>
            {isBatchEdit && (
              <View style={styles.batchInfoCard}>
                <Text style={styles.batchInfoTitle}>Choose Which Sections To Modify</Text>
                <Text style={styles.batchInfoText}>
                  Only the sections enabled below will be applied to the selected users. Disabled sections will be left unchanged.
                </Text>
              </View>
            )}

            <Text style={styles.pageHeader}>Notification Types</Text>
            <Text style={styles.sectionDescription}>
              Choose how notifications are delivered. Email sends reminders to the user&apos;s email address, while push notifications send alerts to a registered mobile device.
            </Text>

            {isBatchEdit && (
              <Checkbox
                label={`Modify ${batchNotificationSectionLabels.notificationTypes}`}
                value={batchSectionsToModify.notificationTypes}
                setValue={(value) =>
                  setBatchSectionsToModify({
                    ...batchSectionsToModify,
                    notificationTypes: value,
                  })
                }
              />
            )}

            {(!isBatchEdit || batchSectionsToModify.notificationTypes) ? (
              <>
                <View>
                  <Checkbox
                    label={"Email"}
                    value={notificationTypes.email}
                    setValue={(value) => setNotificationTypes({ ...notificationTypes, email: value })}
                  />
                  <Text style={styles.optionDescription}>
                    Receive meal reminders and report emails in the user&apos;s inbox.
                  </Text>
                </View>

                <View>
                  <Checkbox
                    label={"Push Notifications (Mobile)"}
                    value={notificationTypes.push}
                    setValue={(value) => setNotificationTypes({ ...notificationTypes, push: value })}
                  />
                  <Text style={styles.optionDescription}>
                    Send quick alerts to the user&apos;s registered phone. This requires a device to be registered first.
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.disabledSectionText}>
                This section will not be modified for the selected users.
              </Text>
            )}

            {
              notificationTypes.push && !isBatchEdit &&
              <MobileNotificationRegister device={device} setDevice={setDevice} />
            }


            <Text style={styles.pageHeader}>Reminder Notifications Schema</Text>
            <Text style={styles.sectionDescription}>
              Decide which kinds of missing-meal reminders the user should receive on each day of the week.
            </Text>

            {isBatchEdit && (
              <Checkbox
                label={`Modify ${batchNotificationSectionLabels.schema}`}
                value={batchSectionsToModify.schema}
                setValue={(value) =>
                  setBatchSectionsToModify({
                    ...batchSectionsToModify,
                    schema: value,
                  })
                }
              />
            )}

            {(!isBatchEdit || batchSectionsToModify.schema) && (
              <GroupCheckboxTable
                data={notificationSchema}
                setData={(newData) => setNotificationSchema(newData)}
              />
            )}

            <Text style={styles.pageHeader}>Report Schema</Text>
            <Text style={styles.sectionDescription}>
              Control when the user receives a summary of their meals. Full Report always sends a summary for that day, while Report on Notifications only sends a summary when a reminder is triggered.
            </Text>

            {isBatchEdit && (
              <Checkbox
                label={`Modify ${batchNotificationSectionLabels.report}`}
                value={batchSectionsToModify.report}
                setValue={(value) =>
                  setBatchSectionsToModify({
                    ...batchSectionsToModify,
                    report: value,
                  })
                }
              />
            )}

            {(!isBatchEdit || batchSectionsToModify.report) && (
              <GroupCheckboxTable
                data={reportSchema}
                setData={(newData) => setReportSchema(newData)}
              />
            )}

            <Text style={styles.pageHeader}>Notification Schedule</Text>
            <Text style={styles.sectionDescription}>
              Choose when the system checks and sends notifications. Morning is for today&apos;s meals, noon is for tomorrow&apos;s meals, and evening is for upcoming packed meals.
            </Text>

            {isBatchEdit && (
              <Checkbox
                label={`Modify ${batchNotificationSectionLabels.schedule}`}
                value={batchSectionsToModify.schedule}
                setValue={(value) =>
                  setBatchSectionsToModify({
                    ...batchSectionsToModify,
                    schedule: value,
                  })
                }
              />
            )}

            {(!isBatchEdit || batchSectionsToModify.schedule) && (
              <GroupCheckboxTable
                data={notificationSchedule}
                setData={(newData) => setNotificationSchedule(newData)}
              />
            )}
            
          </View>
          <View>
            <Button
              title={isBatchEdit ? "Review Changes" : "Save"}
              onPress={savePreferences}
            />
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
  sectionDescription: {
    color: "#55616d",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  optionDescription: {
    color: "#66727e",
    marginTop: -2,
    marginBottom: 8,
    marginLeft: 48,
    lineHeight: 18,
  },
  tableContainer: {
    marginVertical: 20,
  },
  batchInfoCard: {
    backgroundColor: "#eef6fb",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  batchInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3b78a1",
    marginBottom: 6,
  },
  batchInfoText: {
    color: "#4b5b68",
    lineHeight: 20,
  },
  disabledSectionText: {
    color: "#6c757d",
    marginBottom: 16,
    textAlign: "center",
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
