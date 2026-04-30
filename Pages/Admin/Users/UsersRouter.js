import { createStackNavigator } from "@react-navigation/stack";

import Users from "./Users";
import ModifyUser from "./Modify";
import NotificationPreferences from "../../Pref/NotificationPreference";
import BatchNotificationReview from "./BatchNotificationReview";

const Stack = createStackNavigator();

export default function UserRouter({ navigation }) {
  return (
    <Stack.Navigator
      initialRouteName="Users List"
      screenOptions={{
        headerShown: false,
        cardStyle: { flex: 1 },
      }}
    >
      <Stack.Screen name="Users List" component={Users} />
      <Stack.Screen name="Modify User" component={ModifyUser} />
      <Stack.Screen
        name="Batch Notification Preferences"
        component={NotificationPreferences}
      />
      <Stack.Screen
        name="Batch Notification Review"
        component={BatchNotificationReview}
      />
    </Stack.Navigator>
  );
}
