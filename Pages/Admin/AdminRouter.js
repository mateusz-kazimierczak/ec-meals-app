import { createStackNavigator } from "@react-navigation/stack";

import Dashbaord from "./Dashbaord";
import UsersRouter from "./Users/UsersRouter";
import Meals from "./Meals/Meals";
import IdMeals from "../Meals/Meals";
import Diets from "./Diets/Diets";
import Logs from "./Logs/Logs";
import NotificationPreferences from "../Pref/NotificationPreference";
import GeneralPreferences from "../Pref/GeneralPreferences";

const Stack = createStackNavigator();

export default function AdminRouter({ navigation }) {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        cardStyle: { flex: 1 },
      }}
    >
      <Stack.Screen name="Dashboard" component={Dashbaord} />
      <Stack.Screen name="Users" component={UsersRouter} />
      <Stack.Screen name="AllMeals" component={Meals} />
      <Stack.Screen name="IdMeals" component={IdMeals} />
      <Stack.Screen name="Diets" component={Diets} />
      <Stack.Screen name="Logs" component={Logs} returnPaths={["Preferences"]} />
      <Stack.Screen
        name="Admin Notification Preferences"
        component={NotificationPreferences}
      />
      <Stack.Screen
        name="Admin General Preferences"
        component={GeneralPreferences}
      />
    </Stack.Navigator>
  );
}
