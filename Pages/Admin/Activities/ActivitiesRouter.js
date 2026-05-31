import { createStackNavigator } from "@react-navigation/stack";
import ActivitiesList from "./ActivitiesList";
import ActivityCompose from "./ActivityCompose";

const Stack = createStackNavigator();

export default function ActivitiesRouter() {
  return (
    <Stack.Navigator
      initialRouteName="ActivitiesList"
      screenOptions={{ headerShown: false, cardStyle: { flex: 1 } }}
    >
      <Stack.Screen name="ActivitiesList" component={ActivitiesList} />
      <Stack.Screen name="ActivityCompose" component={ActivityCompose} />
    </Stack.Navigator>
  );
}
