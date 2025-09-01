import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import DeepNavLink from "../../../components/header/DeepNavLinks/DeepNavLinks";
import Loader from "../../../components/Loader/Loader";
import ChangeList from "./ChangesList";

import Container from "../../../components/Container/Container";
import { useState, useEffect } from "react";
import { useFetch } from "../../../_helpers/useFetch";

import { Dropdown } from 'react-native-element-dropdown';

const screenWidth = Dimensions.get('window').width;
const isMobile = screenWidth < 768; // Define a breakpoint for mobile

export default function Diets({ navigation, route }) {
  const cFetch = useFetch();

  const user_id = route.params?.user_id; // Accept user_id from route params

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [value, setValue] = useState(user_id ? null : null); // Use null if user_id is true
  const [isFocus, setIsFocus] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [mealHistory, setMealHistory] = useState([]);

  const fetchUsers = async () => {
    if (user_id) return; // Skip fetching users if user_id is true

    setLoading(true);
    const users = await cFetch.get(
      `${process.env.EXPO_PUBLIC_BACKEND_API}/api/users/all`
    );

    if (users) setUsers(users.map(user => ({
      label: `${user.firstName} ${user.lastName}`,
      value: user.id,
    })));

    setValue(users[0]?.id || null);

    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleWeekSelection = (week) => {
    setSelectedWeek(week);
  };

  const weekButtons = [
    { title: "Current Week", key: 1 },
    { title: "Last Week", key: 2 },
    { title: "Two Weeks Ago", key: 3 },
    { title: "Three Weeks Ago", key: 4 },
  ];

  const fetchMealHistory = async () => {
    if (!selectedWeek) {
      return;
    }

    setLoading(true);

    const logs = await cFetch
      .get(
        `${process.env.EXPO_PUBLIC_BACKEND_API}/api/logs`,
        null,
        { userId: user_id, forUser: user_id ? undefined : value, week: selectedWeek } // Send forUser as undefined if user_id is true
      )
      .catch((err) =>
        console.log("Error while fetching data from server: ", err)
      );

    setMealHistory(logs.logs || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMealHistory();
  }, [value, selectedWeek]);

  return (
    <>
      <DeepNavLink
        route={route}
        navigation={navigation}
        routes={route.params.returnPaths}
      />
      <Container>
        <Loader loading={loading}>
          <View style={styles.contentView}>
            <Text style={styles.pageHeader}>
              Meal Sign Up Logs:
            </Text>

            {!user_id && (
              <>
                <Text style={styles.sectionHeader}>
                  Select a User
                </Text>

                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.dropdownPlaceholder}
                  data={users}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? 'Select item' : '...'}
                  searchPlaceholder="Search..."
                  value={value}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setValue(item.value);
                    setIsFocus(false);
                    console.log("Selected user ID:", item.value, "Selected user name:", item.label);
                  }}
                  searchInputProps={{
                    autoFocus: true,
                  }}
                />
              </>
            )}

            {user_id && (
              <Text style={styles.sectionHeader}>
                Your meal changes
              </Text>
            )}

            <Text style={styles.sectionHeader}>
              Select a Week
            </Text>

            <View style={styles.buttonContainer}>
              {weekButtons.map((buttonInfo) => (
                <TouchableOpacity
                  key={buttonInfo.key}
                  style={[
                    styles.weekButton,
                    selectedWeek === buttonInfo.key && styles.selectedWeekButton,
                  ]}
                  onPress={() => handleWeekSelection(buttonInfo.key)}
                >
                  <Text style={[
                    styles.weekButtonText,
                    selectedWeek === buttonInfo.key && styles.selectedWeekButtonText
                  ]}>
                    {buttonInfo.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedWeek && (user_id || value) && (
              <ChangeList mealData={mealHistory} />
            )}
          </View>
        </Loader>
      </Container>
    </>
  );
}


const styles = StyleSheet.create({
  contentView: { 
    paddingHorizontal: isMobile ? 10 : 15,
    paddingTop: isMobile ? 5 : 10,
  },
  pageHeader: {
    fontSize: isMobile ? 24 : 28, 
    fontWeight: "600",
    marginBottom: isMobile ? 15 : 20, 
    textAlign: 'center', 
  },
  sectionHeader: {
    fontSize: isMobile ? 16 : 18, 
    fontWeight: "500", 
    color: '#333', 
    marginTop: isMobile ? 15 : 20, 
    marginBottom: isMobile ? 8 : 12, 
  },
  dropdown: { 
    height: 50,
    borderColor: '#B0B0B0', 
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF', 
  },
  dropdownPlaceholder: { 
    color: '#A0A0A0', 
    fontSize: 15,
  },
  buttonContainer: {
    marginTop: 0, 
    flexDirection: 'row', 
    gap: isMobile ? 5 : 10, 
    justifyContent: 'space-around', 
    marginBottom: isMobile ? 15 : 25, 
  },
  weekButton: {
    flex: 1, 
    paddingVertical: isMobile ? 10 : 12, 
    paddingHorizontal: isMobile ? 5 : 10, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 25, 
    borderWidth: 1,
    borderColor: '#007AFF', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  selectedWeekButton: {
    backgroundColor: '#007AFF', 
  },
  weekButtonText: {
    color: '#007AFF', 
    textAlign: 'center',
    fontSize: isMobile ? 12 : 14, 
    fontWeight: '500',
  },
  selectedWeekButtonText: {
    color: '#FFFFFF', 
    fontWeight: '600',
  },
  selectionInfo: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  }
});
