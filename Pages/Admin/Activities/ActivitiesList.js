import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Container from "../../../components/Container/Container";
import DeepNavLink from "../../../components/header/DeepNavLinks/DeepNavLinks";
import { useFetch } from "../../../_helpers/useFetch";

const STATUS_COLOR = {
  sent: "#28a745",
  schedule: "#fd7e14",
  paused: "#ffc107",
  save: "#6c757d",
  draft: "#6c757d",
  sending: "#17a2b8",
};

const STATUS_LABEL = {
  sent: "Sent",
  schedule: "Scheduled",
  paused: "Paused",
  save: "Draft",
  draft: "Draft",
  sending: "Sending",
};

function formatActivityDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatSendTime(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActivitiesList({ navigation, route }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const cFetch = useFetch();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await cFetch
      .get(`${process.env.EXPO_PUBLIC_BACKEND_API}/api/activities`)
      .catch(() => null);
    setLoading(false);
    if (res?.campaigns) setCampaigns(res.campaigns);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ActivityCompose", {
          campaignId: item.id,
          campaignStatus: item.status,
        })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.activityName || item.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] || "#6c757d" }]}>
          <Text style={styles.badgeText}>
            {STATUS_LABEL[item.status] || item.status}
          </Text>
        </View>
      </View>

      {item.activityDate && (
        <Text style={styles.cardActivityDate}>
          {formatActivityDate(item.activityDate)}
        </Text>
      )}

      {item.sendTime ? (
        <Text style={styles.cardMeta}>
          {item.status === "sent" ? "Sent " : "Scheduled "}
          {formatSendTime(item.sendTime)}
        </Text>
      ) : (
        <Text style={styles.cardMeta}>Not yet scheduled</Text>
      )}

      {item.emailsSent > 0 && (
        <Text style={styles.cardMeta}>{item.emailsSent} recipients</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <DeepNavLink navigation={navigation} routes={["Dashboard"]} />
      <Container>
        <View style={styles.main}>
          <View style={styles.titleRow}>
            <Text style={styles.pageTitle}>Activities</Text>
            <TouchableOpacity
              style={styles.newBtn}
              onPress={() => navigation.navigate("ActivityCompose", {})}
            >
              <Text style={styles.newBtnText}>+ New</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={campaigns}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            refreshing={loading}
            onRefresh={load}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {loading ? "Loading..." : "No activities yet. Tap + New to create one."}
              </Text>
            }
            contentContainerStyle={campaigns.length === 0 ? styles.emptyContainer : null}
          />
        </View>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, padding: 16 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pageTitle: { fontSize: 28, fontWeight: "bold", color: "#3b78a1" },
  newBtn: {
    backgroundColor: "#3b78a1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#212529", flex: 1, marginRight: 8 },
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  cardActivityDate: { fontSize: 14, color: "#3b78a1", fontWeight: "500", marginBottom: 4 },
  cardMeta: { fontSize: 12, color: "#adb5bd", marginTop: 2 },
  empty: { textAlign: "center", color: "#adb5bd", fontSize: 15, marginTop: 40 },
  emptyContainer: { flex: 1 },
});
