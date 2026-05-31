import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Container from "../../../components/Container/Container";
import DeepNavLink from "../../../components/header/DeepNavLinks/DeepNavLinks";
import platformAlert from "../../../_helpers/useAlert";
import { platformConfirm } from "../../../_helpers/useAlert";
import { useFetch } from "../../../_helpers/useFetch";
import RichTextEditor from "../../../components/RichTextEditor/RichTextEditor";

const BASE = process.env.EXPO_PUBLIC_BACKEND_API;

function titleFromDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T12:00:00`);
  if (isNaN(d.getTime())) return "";
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const day = d.getDate();
  return `${weekday} ${month} ${day} - University Activity`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function wednesdayAt7pm(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T12:00:00`);
  if (isNaN(d.getTime())) return "";
  const iso = d.getDay() === 0 ? 7 : d.getDay();
  const wed = new Date(d);
  wed.setDate(d.getDate() + (3 - iso));
  const y = wed.getFullYear();
  const m = String(wed.getMonth() + 1).padStart(2, "0");
  const day = String(wed.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T19:00`;
}

// MM/DD from a YYYY-MM-DD string
function toMMDD(dateStr) {
  if (!dateStr) return "??/??";
  const d = new Date(`${dateStr}T12:00:00`);
  if (isNaN(d.getTime())) return "??/??";
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function buildDefaultBody(dateStr, activityName) {
  const mmdd = toMMDD(dateStr);
  const name = activityName?.trim() || "[ACTIVITY NAME]";
  return (
    `<p>Hi&nbsp;*|FNAME|*,</p>` +
    `<p>Join us this Friday for a meditation, supper, and get-together. Afterwards, </p>` +
    `<p><strong>THIS FRIDAY ${mmdd}: ${name}</strong><br>` +
    `6:00 pm - Meditation<br>` +
    `6:30 pm - Supper<br>` +
    `7:00 pm - Get-together<br>` +
    `7:30 pm - ${name}</p>`
  );
}

// Returns true if body is effectively empty (only whitespace/empty tags)
function isBodyEmpty(html) {
  return !html || html.replace(/<[^>]+>/g, "").trim() === "";
}

export default function ActivityCompose({ navigation, route }) {
  const {
    campaignId,
    campaignTitle = "",
    campaignStatus,
  } = route?.params || {};

  const isReadOnly = !!campaignStatus && !["save", "draft", "paused"].includes(campaignStatus);

  const initialDate = todayStr();
  const [activityDate, setActivityDate] = useState(initialDate);
  const [activityName, setActivityName] = useState("");
  const [title, setTitle] = useState(campaignTitle || titleFromDate(initialDate));
  const [body, setBody] = useState(buildDefaultBody(initialDate, ""));
  const [sendDateTime, setSendDateTime] = useState(wednesdayAt7pm(initialDate));
  const [showSchedule, setShowSchedule] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [previewHtml, setPreviewHtml] = useState("");
  const [draftId, setDraftId] = useState(campaignId || null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const titleManuallyEdited = useRef(false);
  const sendTimeManuallyEdited = useRef(false);
  const bodyManuallyEdited = useRef(false);
  const prevActivityNameRef = useRef("[ACTIVITY NAME]");
  const cFetch = useFetch();

  // Load existing draft from MongoDB on mount
  useEffect(() => {
    if (!campaignId) return;
    cFetch.get(`${BASE}/api/activities/${campaignId}`).then((res) => {
      if (!res) return;
      // Lock all reseed effects before setting state
      titleManuallyEdited.current = true;
      sendTimeManuallyEdited.current = true;
      bodyManuallyEdited.current = true;

      if (res.title) setTitle(res.title);

      const loadedName = res.activityName || "";
      prevActivityNameRef.current = loadedName || "[ACTIVITY NAME]";
      setActivityName(loadedName);

      if (res.activityDate) {
        const d = new Date(res.activityDate);
        setActivityDate(d.toISOString().slice(0, 10));
      }
      if (res.body) setBody(res.body);
      if (res.sendTime) {
        const st = new Date(res.sendTime);
        const pad = (n) => String(n).padStart(2, "0");
        setSendDateTime(
          `${st.getFullYear()}-${pad(st.getMonth() + 1)}-${pad(st.getDate())}T${pad(st.getHours())}:${pad(st.getMinutes())}`
        );
        sendTimeManuallyEdited.current = true;
      }
    }).catch(() => null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reseed title and send time when date changes
  useEffect(() => {
    if (!titleManuallyEdited.current && activityDate) {
      setTitle(titleFromDate(activityDate));
    }
    if (!sendTimeManuallyEdited.current && activityDate) {
      setSendDateTime(wednesdayAt7pm(activityDate));
    }
  }, [activityDate]);

  // Full body reseed when date changes and author hasn't edited yet
  useEffect(() => {
    if (!bodyManuallyEdited.current) {
      const newBody = buildDefaultBody(activityDate, activityName);
      setBody(newBody);
      prevActivityNameRef.current = activityName?.trim() || "[ACTIVITY NAME]";
    }
  }, [activityDate]);

  // Live placeholder replacement when activity name changes — always runs,
  // regardless of bodyManuallyEdited, so the name stays in sync even after edits.
  useEffect(() => {
    const prev = prevActivityNameRef.current;
    const next = activityName?.trim() || "[ACTIVITY NAME]";
    if (prev === next) return;
    setBody((current) => {
      const escaped = prev.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return current.replace(new RegExp(escaped, "g"), next);
    });
    prevActivityNameRef.current = next;
  }, [activityName]);

  const handleTitleChange = (val) => {
    titleManuallyEdited.current = true;
    setTitle(val);
  };

  const handleActivityDateChange = (val) => {
    setActivityDate(val);
    if (!val) {
      titleManuallyEdited.current = false;
      sendTimeManuallyEdited.current = false;
      bodyManuallyEdited.current = false;
      prevActivityNameRef.current = "[ACTIVITY NAME]";
    }
  };

  const handleActivityNameChange = (val) => {
    setActivityName(val);
  };

  const handleBodyChange = (html) => {
    bodyManuallyEdited.current = true;
    setBody(html);
  };

  const handleSendDateTimeChange = (val) => {
    sendTimeManuallyEdited.current = true;
    setSendDateTime(val);
  };

  // --- Preview ---

  const fetchMailchimpPreview = async () => {
    if (!title.trim() || isBodyEmpty(body)) {
      platformAlert("Missing fields", "Fill in the title and body first.");
      setActiveTab(0);
      return;
    }
    setPreviewLoading(true);
    let res;
    if (draftId) {
      res = await cFetch
        .patch(`${BASE}/api/activities/${draftId}`, { title, body, activityDate, activityName })
        .catch(() => null);
    } else {
      res = await cFetch
        .post(`${BASE}/api/activities`, { title, body, activityDate, activityName })
        .catch(() => null);
      if (res?.id) setDraftId(res.id);
    }
    setPreviewLoading(false);
    if (res?.html) {
      setPreviewHtml(res.html);
    } else {
      platformAlert("Error", "Could not load preview. Make sure the backend is running.");
      setActiveTab(0);
    }
  };

  const handleTabPress = (tabIndex) => {
    setActiveTab(tabIndex);
    if (tabIndex === 1) fetchMailchimpPreview();
  };

  // --- Save / Send ---

  const saveDraft = async () => {
    if (!title.trim() || isBodyEmpty(body)) {
      platformAlert("Missing fields", "Title and body are required.");
      return;
    }
    setLoading(true);
    let res;
    if (draftId) {
      res = await cFetch
        .patch(`${BASE}/api/activities/${draftId}`, { title, body, activityDate, activityName })
        .catch(() => null);
    } else {
      res = await cFetch
        .post(`${BASE}/api/activities`, { title, body, activityDate, activityName })
        .catch(() => null);
      if (res?.id) setDraftId(res.id);
    }
    setLoading(false);
    if (res) {
      platformAlert("Saved", "Draft saved to Mailchimp.");
    } else {
      platformAlert("Error", "Failed to save draft.");
    }
  };

  const sendCampaign = async (scheduleAt) => {
    if (!draftId) {
      platformAlert("Save first", "Save the draft before sending.");
      return;
    }
    setLoading(true);
    const reqBody = scheduleAt ? { schedule_time: scheduleAt } : {};
    const res = await cFetch
      .post(`${BASE}/api/activities/${draftId}/send`, reqBody)
      .catch(() => null);
    setLoading(false);
    if (res?.ok) {
      platformAlert("Success", scheduleAt ? "Campaign scheduled!" : "Campaign sent!");
      navigation.navigate("ActivitiesList");
    } else {
      platformAlert("Error", "Failed to send. Make sure the draft is saved first.");
    }
  };

  const handleSendTest = async () => {
    if (!draftId) {
      platformAlert("Save first", "Save the draft before sending a test.");
      return;
    }
    setLoading(true);
    const res = await cFetch
      .post(`${BASE}/api/activities/${draftId}/test`, {})
      .catch(() => null);
    setLoading(false);
    if (res?.ok) {
      platformAlert("Test sent", `Test email sent to ${res.sentTo}`);
    } else {
      platformAlert("Error", "Could not send test email. Make sure your account has an email address set.");
    }
  };

  const handleSendNow = async () => {
    const confirmed = await platformConfirm(
      "Send Campaign",
      "Send this campaign to all University Activities subscribers now?"
    );
    if (confirmed) sendCampaign(null);
  };

  const handleSchedule = async () => {
    if (!sendDateTime.trim()) {
      platformAlert("No send time", "Choose when to send the email.");
      return;
    }
    const dt = new Date(sendDateTime);
    if (isNaN(dt.getTime())) {
      platformAlert("Invalid date", "Enter a valid date and time.");
      return;
    }
    const minTime = new Date(Date.now() + 15 * 60 * 1000);
    if (dt < minTime) {
      platformAlert("Too soon", "Schedule time must be at least 15 minutes from now.");
      return;
    }
    const confirmed = await platformConfirm(
      "Schedule Campaign",
      `Schedule send for ${dt.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}?`
    );
    if (confirmed) sendCampaign(dt.toISOString());
  };

  const handleDelete = async () => {
    if (!draftId) return;
    const confirmed = await platformConfirm(
      "Delete Draft",
      "Delete this draft from Mailchimp permanently?",
      { confirmText: "Delete", destructive: true }
    );
    if (!confirmed) return;
    setLoading(true);
    await cFetch.delete(`${BASE}/api/activities/${draftId}`).catch(() => null);
    setLoading(false);
    navigation.navigate("ActivitiesList");
  };

  // --- Render ---

  const renderCompose = () => (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {isReadOnly && (
        <View style={styles.readOnlyBanner}>
          <Text style={styles.readOnlyText}>
            This campaign has already been sent and cannot be edited.
          </Text>
        </View>
      )}

      {/* Activity Date */}
      <Text style={styles.label}>Activity Date *</Text>
      <Text style={styles.hint}>Sets the title, subject, and pre-fills the body.</Text>
      {Platform.OS === "web" ? (
        <View style={styles.webInputWrap}>
          <input
            type="date"
            style={webInputBase}
            value={activityDate}
            onChange={(e) => handleActivityDateChange(e.target.value)}
            disabled={isReadOnly}
          />
        </View>
      ) : (
        <TextInput
          style={styles.input}
          value={activityDate}
          onChangeText={handleActivityDateChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
          editable={!isReadOnly}
        />
      )}

      {/* Activity Name */}
      <Text style={styles.label}>Activity Name *</Text>
      <Text style={styles.hint}>e.g. "Indoor Soccer" — used in the email body.</Text>
      <TextInput
        style={styles.input}
        value={activityName}
        onChangeText={handleActivityNameChange}
        placeholder="Indoor Soccer"
        placeholderTextColor="#999"
        editable={!isReadOnly}
      />

      {/* Email Title */}
      <Text style={styles.label}>Email Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={handleTitleChange}
        placeholder="Auto-filled from activity date"
        placeholderTextColor="#999"
        editable={!isReadOnly}
      />

      {/* Rich text body */}
      <Text style={styles.label}>Email Body *</Text>
      <RichTextEditor
        value={body}
        onChange={isReadOnly ? undefined : handleBodyChange}
      />

      {!isReadOnly && (
        <>
          {/* Schedule */}
          <TouchableOpacity
            style={styles.toggleSchedule}
            onPress={() => setShowSchedule(!showSchedule)}
          >
            <Text style={styles.toggleText}>
              {showSchedule ? "▲ Hide send schedule" : "▼ Schedule send time"}
            </Text>
          </TouchableOpacity>

          {showSchedule && (
            <>
              <Text style={styles.label}>Send Date & Time</Text>
              <Text style={styles.hint}>Must be at least 15 minutes in the future.</Text>
              {Platform.OS === "web" ? (
                <View style={styles.webInputWrap}>
                  <input
                    type="datetime-local"
                    style={webInputBase}
                    value={sendDateTime}
                    onChange={(e) => handleSendDateTimeChange(e.target.value)}
                  />
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={sendDateTime}
                  onChangeText={handleSendDateTimeChange}
                  placeholder="YYYY-MM-DDTHH:mm"
                  placeholderTextColor="#999"
                />
              )}
            </>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.draftBtn} onPress={saveDraft} disabled={loading}>
              <Text style={styles.draftBtnText}>{loading ? "Saving…" : "Save Draft"}</Text>
            </TouchableOpacity>
            {draftId && (
              <TouchableOpacity style={styles.testBtn} onPress={handleSendTest} disabled={loading}>
                <Text style={styles.testBtnText}>Send Test Email</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.sendRow}>
            <TouchableOpacity
              style={[styles.sendBtn, loading && styles.btnDisabled]}
              onPress={handleSendNow}
              disabled={loading}
            >
              <Text style={styles.sendBtnText}>Send Now</Text>
            </TouchableOpacity>
            {showSchedule && (
              <TouchableOpacity
                style={[styles.scheduleBtn, loading && styles.btnDisabled]}
                onPress={handleSchedule}
                disabled={loading}
              >
                <Text style={styles.scheduleBtnText}>Schedule Send</Text>
              </TouchableOpacity>
            )}
          </View>

          {draftId && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>Delete Draft</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );

  const renderPreview = () => {
    if (previewLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b78a1" />
          <Text style={styles.loadingText}>Loading preview…</Text>
        </View>
      );
    }
    if (!previewHtml) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No preview available.</Text>
        </View>
      );
    }
    if (Platform.OS === "web") {
      return (
        <iframe
          srcDoc={previewHtml}
          style={iframeStyle}
          sandbox="allow-same-origin"
          title="Email Preview"
        />
      );
    }
    return (
      <ScrollView style={styles.nativePreview}>
        <Text style={styles.nativeNote}>Full preview available on web. Text preview:</Text>
        <Text style={styles.nativeTitle}>{title}</Text>
        <Text style={styles.nativeBody}>{body.replace(/<[^>]+>/g, "")}</Text>
      </ScrollView>
    );
  };

  return (
    <>
      <DeepNavLink navigation={navigation} routes={["Dashboard", "ActivitiesList"]} />
      <Container>
        <View style={styles.main}>
          <Text style={styles.pageTitle}>
            {draftId ? "Edit Campaign" : "New Campaign"}
          </Text>

          <View style={styles.tabBar}>
            {["Compose", "Preview"].map((tab, i) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === i && styles.tabActive]}
                onPress={() => handleTabPress(i)}
              >
                <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 0 ? renderCompose() : renderPreview()}
        </View>
      </Container>
    </>
  );
}

const webInputBase = {
  width: "100%",
  height: 44,
  border: "1px solid #ced4da",
  borderRadius: 8,
  paddingLeft: 12,
  paddingRight: 8,
  fontSize: 15,
  color: "#495057",
  backgroundColor: "#fff",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const iframeStyle = {
  flex: 1,
  border: "none",
  width: "100%",
  minHeight: 560,
  borderRadius: 8,
  backgroundColor: "#fff",
};

const styles = StyleSheet.create({
  main: { flex: 1, padding: 16 },
  pageTitle: { fontSize: 26, fontWeight: "bold", color: "#3b78a1", marginBottom: 16 },
  tabBar: {
    flexDirection: "row",
    borderRadius: 8,
    backgroundColor: "#e9ecef",
    padding: 3,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: { fontSize: 14, color: "#6c757d", fontWeight: "500" },
  tabTextActive: { color: "#3b78a1", fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: "600", color: "#495057", marginBottom: 4, marginTop: 14 },
  hint: { fontSize: 12, color: "#6c757d", marginBottom: 6 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: "#fff",
    color: "#495057",
  },
  webInputWrap: { width: "100%", overflow: "hidden" },
  toggleSchedule: { marginTop: 18, paddingVertical: 6 },
  toggleText: { color: "#3b78a1", fontSize: 14, fontWeight: "500" },
  actions: { marginTop: 20 },
  draftBtn: {
    borderWidth: 2,
    borderColor: "#3b78a1",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  draftBtnText: { color: "#3b78a1", fontWeight: "600", fontSize: 15 },
  testBtn: {
    borderWidth: 1,
    borderColor: "#6c757d",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  testBtnText: { color: "#6c757d", fontWeight: "500", fontSize: 14 },
  sendRow: { flexDirection: "row", gap: 10 },
  sendBtn: {
    flex: 1,
    backgroundColor: "#3b78a1",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  sendBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  scheduleBtn: {
    flex: 1,
    backgroundColor: "#fd7e14",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  scheduleBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  btnDisabled: { opacity: 0.5 },
  deleteBtn: { marginTop: 24, paddingVertical: 10, alignItems: "center" },
  deleteBtnText: { color: "#dc3545", fontSize: 14 },
  readOnlyBanner: {
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  readOnlyText: { color: "#856404", fontSize: 13 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  loadingText: { marginTop: 12, color: "#6c757d", fontSize: 14 },
  emptyText: { color: "#adb5bd", fontSize: 15, textAlign: "center" },
  nativePreview: { flex: 1, padding: 4 },
  nativeNote: {
    backgroundColor: "#fff3cd",
    padding: 10,
    borderRadius: 6,
    color: "#856404",
    fontSize: 12,
    marginBottom: 14,
  },
  nativeTitle: { fontSize: 22, fontWeight: "bold", color: "#212529", marginBottom: 12 },
  nativeBody: { fontSize: 15, color: "#555", lineHeight: 24 },
});
