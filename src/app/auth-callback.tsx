import { AuthFeedback } from "@/components/auth-feedback";
import { completeAuthUrl } from "@/lib/auth";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

export default function AuthCallbackScreen() {
  const linkingUrl = Linking.useLinkingURL();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const url =
      Platform.OS === "web" && typeof window !== "undefined"
        ? window.location.href
        : linkingUrl;
    if (!url) return;
    let active = true;
    completeAuthUrl(url)
      .then((recovery) => {
        if (active) {
          if (Platform.OS === "web")
            window.history.replaceState({}, "", "/auth-callback");
          router.replace(recovery ? "/reset-password" : "/home");
        }
      })
      .catch((cause) => {
        if (active)
          setError(cause instanceof Error ? cause.message : "Sign-in failed.");
      });
    return () => {
      active = false;
    };
  }, [linkingUrl]);
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <AuthFeedback busy={!error} error={error} />
      {error && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/login")}
        >
          <Text>Return to sign in</Text>
        </Pressable>
      )}
    </View>
  );
}
