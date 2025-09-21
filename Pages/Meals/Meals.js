import { StyleSheet, View, Dimensions, Text, ScrollView } from "react-native";
import Container from "../../components/Container/Container";
import DeepNavLink from "../../components/header/DeepNavLinks/DeepNavLinks";
import Week from "./Week";

import { useState } from "react";

export default function Meals({ children, style, route, navigation }) {
  const user_id = route.params?.user_id;
  const returnPaths = route.params?.returnPaths;

  const [weekSavedState, setWeekSavedState] = useState(0); // 0 - saved, 1 - loading, 2 - not saved

  return (
    <>
      {returnPaths && (
        <DeepNavLink
          route={route}
          navigation={navigation}
          routes={returnPaths}
        />
      )}
      <Container wide={true} maxHeight={false} state={weekSavedState} >
        <Week user_id={user_id} setSaveState={setWeekSavedState} />
      </Container>
    </>
  );
}
