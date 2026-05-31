import { TextInput, StyleSheet } from "react-native";

// Plain multiline TextInput fallback for native.
// The value/onChange contract mirrors the web version (HTML strings) so
// ActivityCompose works unchanged on both platforms.
function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function RichTextEditor({ value, onChange }) {
  // Strip tags for display; emit minimal HTML on change
  const plainValue = value?.replace(/<[^>]+>/g, "") || "";

  const handleChange = (text) => {
    const html = text
      .split("\n")
      .map((line) => `<p>${escHtml(line)}</p>`)
      .join("");
    onChange?.(html);
  };

  return (
    <TextInput
      style={styles.input}
      value={plainValue}
      onChangeText={handleChange}
      multiline
      textAlignVertical="top"
      placeholder="Email body content…"
      placeholderTextColor="#999"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#fff",
    color: "#495057",
  },
});
