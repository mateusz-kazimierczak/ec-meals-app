import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icons from "@expo/vector-icons/Ionicons";

export default function OfflineGate({
  isConnectionKnown,
  isRefreshing = false,
  onRetry,
}) {
  const isLoading = !isConnectionKnown;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Icons
            name={isLoading ? "cloud-outline" : "cloud-offline-outline"}
            size={64}
            color="#3b78a1"
          />
          <Text style={styles.title}>
            {isLoading ? "Checking connection" : "Internet connection required"}
          </Text>
          <Text style={styles.description}>
            {isLoading
              ? "The app is confirming that your device can reach the internet."
              : "EC Meals only works when your device is online. Reconnect to the internet to continue."}
          </Text>

          {isLoading ? (
            <ActivityIndicator size="large" color="#3b78a1" style={styles.spinner} />
          ) : (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onRetry}
              disabled={isRefreshing}
              style={[styles.button, isRefreshing && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>
                {isRefreshing ? "Checking..." : "Check Again"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f7fb",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#7f95a5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  title: {
    marginTop: 18,
    fontSize: 28,
    fontWeight: "700",
    color: "#244a64",
    textAlign: "center",
  },
  description: {
    marginTop: 14,
    fontSize: 17,
    lineHeight: 25,
    color: "#486479",
    textAlign: "center",
  },
  spinner: {
    marginTop: 28,
  },
  button: {
    marginTop: 28,
    backgroundColor: "#3b78a1",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 26,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
