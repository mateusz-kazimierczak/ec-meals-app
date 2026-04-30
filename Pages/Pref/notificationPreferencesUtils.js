import { DaysOfTheWeek } from "../Meals/common";

export const batchNotificationSectionLabels = {
  notificationTypes: "Notification Types",
  schema: "Reminder Notifications",
  report: "Report Schema",
  schedule: "Notification Schedule",
};

export const defaultNotificationPreferences = {
  notificationTypes: {
    email: false,
    push: false,
  },
  schema: {
    meals: Array(7).fill(false),
    packed_meals: Array(7).fill(false),
    any_meals: Array(7).fill(true),
  },
  schedule: {
    morning: Array(7).fill(true),
    noon: Array(7).fill(false),
    evening: Array(7).fill(false),
  },
  report: {
    full_report: Array(7).fill(false),
    report_on_notifications: Array(7).fill(true),
  },
};

export const createNotificationSchema = (userSchema = {}) => ({
  meals: {
    title: "Normal Meals",
    values: userSchema.meals || Array(7).fill(false),
    group: 1,
  },
  packed_meals: {
    title: "Packed Meals",
    values: userSchema.packed_meals || Array(7).fill(false),
    group: 1,
  },
  any_meals: {
    title: "Any Meals",
    values: userSchema.any_meals || Array(7).fill(false),
    group: 2,
  },
});

export const createReportSchema = (userSchema = {}) => ({
  full_report: {
    title: "Full Report",
    values: userSchema.full_report || Array(7).fill(false),
    group: 1,
  },
  report_on_notifications: {
    title: "Report on Notifications",
    values: userSchema.report_on_notifications || Array(7).fill(false),
    group: 2,
  },
});

export const createNotificationSchedule = (userSchedule = {}) => ({
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
  },
});

export const createInitialNotificationEditorState = (preferences = defaultNotificationPreferences) => ({
  notificationSchema: createNotificationSchema(preferences.schema),
  notificationSchedule: createNotificationSchedule(preferences.schedule),
  reportSchema: createReportSchema(preferences.report),
  notificationTypes: {
    email: preferences.notificationTypes?.email || false,
    push: preferences.notificationTypes?.push || false,
  },
  device: preferences.device || null,
});

export const createBatchSectionsToModify = () => ({
  notificationTypes: false,
  schema: false,
  report: false,
  schedule: false,
});

export const serializeNotificationPreferences = ({
  notificationSchema,
  notificationSchedule,
  reportSchema,
  notificationTypes,
  device,
}) => ({
  schema: Object.fromEntries(
    Object.entries(notificationSchema).map(([key, value]) => [key, value.values])
  ),
  schedule: Object.fromEntries(
    Object.entries(notificationSchedule).map(([key, value]) => [key, value.values])
  ),
  report: Object.fromEntries(
    Object.entries(reportSchema).map(([key, value]) => [key, value.values])
  ),
  notificationTypes,
  device,
});

export const formatSelectedDays = (values = []) => {
  const selectedDays = DaysOfTheWeek.slice(1).filter((day, index) => values[index]);
  return selectedDays.length > 0 ? selectedDays.join(", ") : "None";
};

export const buildNotificationSummarySections = (preferences) => [
  {
    key: "notificationTypes",
    title: "Notification Types",
    rows: [
      ["Email", preferences.notificationTypes?.email ? "On" : "Off"],
      ["Push Notifications", preferences.notificationTypes?.push ? "On" : "Off"],
    ],
  },
  {
    key: "schema",
    title: "Reminder Notifications",
    rows: [
      ["Normal Meals", formatSelectedDays(preferences.schema?.meals)],
      ["Packed Meals", formatSelectedDays(preferences.schema?.packed_meals)],
      ["Any Meals", formatSelectedDays(preferences.schema?.any_meals)],
    ],
  },
  {
    key: "report",
    title: "Report Schema",
    rows: [
      ["Full Report", formatSelectedDays(preferences.report?.full_report)],
      ["Report on Notifications", formatSelectedDays(preferences.report?.report_on_notifications)],
    ],
  },
  {
    key: "schedule",
    title: "Notification Schedule",
    rows: [
      ["Morning", formatSelectedDays(preferences.schedule?.morning)],
      ["Noon", formatSelectedDays(preferences.schedule?.noon)],
      ["Evening", formatSelectedDays(preferences.schedule?.evening)],
    ],
  },
];

export const getEnabledBatchSectionLabels = (sectionsToModify = {}) =>
  Object.entries(batchNotificationSectionLabels)
    .filter(([key]) => sectionsToModify[key])
    .map(([, label]) => label);
