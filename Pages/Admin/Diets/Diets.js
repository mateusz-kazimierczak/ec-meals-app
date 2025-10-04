import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import DeepNavLink from "../../../components/header/DeepNavLinks/DeepNavLinks";

import Container from "../../../components/Container/Container";
import { useState, useEffect } from "react";
import { useFetch } from "../../../_helpers/useFetch";

import platformAlert from "../../../_helpers/useAlert";

export default function Diets({ navigation, route }) {
  const [newDietName, setNewDietName] = useState("");
  const [diets, setDiets] = useState([]);
  const cFetch = useFetch();

  useEffect(() => {
    fetchDiets();
  }, []);

  const fetchDiets = async () => {
    const res = await cFetch
      .get(`${process.env.EXPO_PUBLIC_BACKEND_API}/api/diets`)
      .catch((err) =>
        console.log("Error while fetching data from server: ", err)
      );

    if (res.message == "OK") {
      setDiets(res.data);
    }
  };

  const newDiet = async () => {
    const res = await cFetch
      .post(`${process.env.EXPO_PUBLIC_BACKEND_API}/api/diets`, {
        name: newDietName,
      })
      .catch((err) =>
        console.log("Error while fetching data from server: ", err)
      );

    if (res.message == "DupKey") {
      console.log("Diet with that name already exists");
      return platformAlert(
        "Invalid name",
        "Diet with that name already exists"
      );
    }

    if (res.message == "OK") {
      console.log("Diet added");
      setNewDietName("");
      setDiets([...diets, res.diet]);
    }
  };

  const removeDiet = async (id) => {
    const res = await cFetch
      .delete(`${process.env.EXPO_PUBLIC_BACKEND_API}/api/diets`, { id })
      .catch((err) =>
        console.log("Error while fetching data from server: ", err)
      );

    console.log("Response: ", res);

    if (res.message == "OK") {
      console.log("Diet removed");
      setDiets(diets.filter((diet) => diet.id !== id));
    }
  };

  // FlatList components
  const Item = ({ diet }) => (
    <View key={diet.id} style={styles.dietCard}>
      <View style={styles.dietInfo}>
        <Text style={styles.dietName}>{diet.name}</Text>
      </View>
      <Button 
        title="Remove" 
        color="#dc3545"
        onPress={() => removeDiet(diet.id)}
      />
    </View>
  );

  const renderItem = ({ item, index }) => <Item diet={item} />;

  return (
    <>
      <DeepNavLink
        route={route}
        navigation={navigation}
        routes={["Dashboard"]}
      />
      <Container>
        <View style={styles.mainContainer}>
          <Text style={styles.pageTitle}>Diet Management</Text>
          
          {/* Add new diet section */}
          <View style={styles.addSection}>
            <Text style={styles.sectionTitle}>Add New Diet</Text>
            <View style={styles.inputContainer}>
              <TextInput
                onChangeText={(val) => setNewDietName(val)}
                value={newDietName}
                style={styles.textInput}
                placeholder="Enter diet name"
                placeholderTextColor="#999"
              />
              <Button 
                title="Add Diet" 
                color="#3b78a1"
                onPress={newDiet}
              />
            </View>
          </View>

          {/* Diets list section */}
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>
              Current Diets ({diets.length})
            </Text>
            <FlatList
              data={diets}
              renderItem={renderItem}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={DietListEmpty}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Container>
    </>
  );
}

const DietListEmpty = () => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No diets available</Text>
      <Text style={styles.emptySubtext}>
        Add your first diet using the form above
      </Text>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b78a1',
    textAlign: 'center',
    marginBottom: 24,
  },
  addSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#495057',
  },
  listSection: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  dietCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dietInfo: {
    flex: 1,
  },
  dietName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  dietId: {
    fontSize: 14,
    color: '#6c757d',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 20,
  },
});
