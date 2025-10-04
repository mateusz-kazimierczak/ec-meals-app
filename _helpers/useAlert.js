import { Platform, Alert } from "react-native";

export default function platformAlert(title, message) {
  if (Platform.OS === "web") {
    return alert(`${title}: ${message}`);
  } else {
    return Alert.alert(title, message);
  }
}

export function platformConfirm(title, message, options = {}) {
  const {
    confirmText = "Yes",
    cancelText = "No",
    destructive = false
  } = options;

  return new Promise((resolve) => {
    if (Platform.OS === "web") {
      // Use browser's confirm dialog for web
      const result = confirm(`${title}\n\n${message}`);
      resolve(result);
    } else {
      // Use React Native Alert for mobile
      Alert.alert(
        title,
        message,
        [
          {
            text: cancelText,
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: confirmText,
            style: destructive ? "destructive" : "default",
            onPress: () => resolve(true),
          },
        ],
        { cancelable: true, onDismiss: () => resolve(false) }
      );
    }
  });
}
