import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
import { useFetch } from "../../../_helpers/useFetch";

const BASE = process.env.EXPO_PUBLIC_BACKEND_API;

function formatActivityDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function HomeActivity() {
  const [activity, setActivity] = useState(undefined); // undefined = loading, null = none
  const cFetch = useFetch();

  useEffect(() => {
    cFetch
      .get(`${BASE}/api/home/current-activity`)
      .then((res) => setActivity(res?.activity ?? null))
      .catch(() => setActivity(null));
  }, []);

  if (!activity) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>University Activity</Text>
        <Text style={styles.headerDate}>{formatActivityDate(activity.activityDate)}</Text>
      </View>

      <View style={styles.body}>
        {Platform.OS === "web" ? (
          <div
            style={{ fontFamily: "Helvetica, Arial, sans-serif", fontSize: 15, color: "#212529", lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: activity.body }}
          />
        ) : (
          <Text style={styles.bodyText}>
            {(activity.body || "").replace(/<[^>]+>/g, "").trim()}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: screenWidth > 500 ? "50%" : "95%",
    alignSelf: "center",
    marginTop: screenWidth > 500 ? 15 : 5,
    marginBottom: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0ecf5",
    shadowColor: "#ababab",
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  header: {
    backgroundColor: "#3b78a1",
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  headerLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerDate: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  body: {
    padding: 18,
  },
  bodyText: {
    fontSize: 15,
    color: "#212529",
    lineHeight: 22,
  },
});
