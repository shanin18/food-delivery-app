import { Colors } from "@/constants/theme";
import { ActivityIndicator, Text, View } from "react-native";

export function AuthFeedback({
  busy = false,
  error,
}: {
  busy?: boolean;
  error: string | null;
}) {
  return (
    <View style={{ gap: 12, marginVertical: busy || error ? 12 : 0 }}>
      {busy && (
        <ActivityIndicator
          color={Colors.primary}
          accessibilityLabel="Please wait"
        />
      )}
      {error && (
        <Text
          accessibilityRole="alert"
          style={{ color: Colors.error, lineHeight: 22 }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
