'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Header,
  TouchableWithoutFeedback,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import Container from "../../../components/Container/Container";
import Loader from "../../../components/Loader/Loader";
import { useFetch } from "../../../_helpers/useFetch";

export const revalidate = 60 * 5;

export default function HomeCurrentMeal({ navigation, route }) {
    const cFetch = useFetch();
    const [loading, setLoading] = useState(false);
    const [currentMeal, setCurrentMeal] = useState(null);

    const fetchCurrentMeal = async () => {
        setLoading(true);
        const res = await cFetch.get(
            `${process.env.EXPO_PUBLIC_BACKEND_API}/api/home/current_meals`
        );
        console.log("Current meal: ", res);
        setCurrentMeal(res);
        setLoading(false);
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchCurrentMeal();
        }, [])
    );

    return (
        <>
            <Container>
                <Loader loading={loading}>
                {currentMeal && (
                    <>
                    <View style={styles.mealNameTopContainer}>
                        <Text style={styles.permanentLabel}>Current meal:</Text>
                        <Text style={styles.mealNameLable}>{currentMeal.meal}</Text>
                    </View>
                    <View style={styles.mealNameContainer}>
                    {currentMeal && currentMeal.meals.map(meal => (
                        <View style={styles.singleNameContainer} key={meal.name}>
                            <Text style={styles.singleMealName}>{meal.name}</Text>
                        </View>
                    ))}
                    </View>
                
                    </>)}
                </Loader>
            </Container>
        </>
    );
}

const styles = StyleSheet.create({
    permanentLabel: {
        fontSize: 20,
        textDecorationLine: "underline",
    },
    mealNameTopContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    mealNameLable: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#3b78a1",
    },
    mealNameContainer: {
        flex: 2,
        flexDirection: "row",
        marginTop: 20,
        flexWrap: "wrap",
        alignItems: "flex-start",
    },
    singleMealName: {
        fontSize: 19,
        margin: 5
    },
    singleNameContainer: {
        width: "50%",
    }
});
