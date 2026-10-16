import {
  ProfileHeader,
  profileStyles as shared,
} from "@/components/profile-ui";
import { Colors, Fonts } from "@/constants/theme";
import { usePayment } from "@/providers/payment-provider";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function ProfileSectionScreen() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const { orders } = usePayment();
  const title =
    section === "faq"
      ? "FAQs"
      : section === "reviews"
        ? "User Reviews"
        : section === "settings"
          ? "Settings"
          : "Notifications";
  const entries =
    section === "faq"
      ? [
          {
            title: "How do I update my delivery address?",
            text: "Open Profile → Addresses. Tap the map to select a location, fill in your apartment, and save.",
          },
          {
            title: "Where can I see my order?",
            text: "Open My Orders and select Track Order. The current map route is a preview until courier tracking is connected.",
          },
          {
            title: "How can I contact my delivery partner?",
            text: "Expand the tracking panel and choose the message button. Messaging requires an assigned courier.",
          },
        ]
      : section === "reviews"
        ? orders
            .filter((order) => order.rating)
            .map((order) => ({
              title: `${order.rating}/5 stars`,
              text: `Order #${order.id.slice(-6)}`,
            }))
        : orders.map((order) => ({
            title: `Order #${order.id.slice(-6)}`,
            text:
              order.status === "ongoing"
                ? "Your checkout is complete."
                : order.status === "completed"
                  ? "Your order was marked as received."
                  : "Your order was cancelled.",
          }));
  return (
    <SafeAreaView style={shared.screen}>
      <ProfileHeader title={title} />
      <ScrollView contentContainerStyle={shared.content}>
        {section === "settings" ? (
          <>
            <Pressable
              accessibilityRole="button"
              style={shared.button}
              onPress={() => router.push("/edit-profile")}
            >
              <Text style={shared.buttonText}>EDIT ACCOUNT DETAILS</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={{ paddingVertical: 24 }}
              onPress={() => router.push("/forgot-password")}
            >
              <Text style={{ fontFamily: Fonts.medium, color: Colors.primary }}>
                Reset password
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            {entries.map((entry, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: Colors.surfaceSecondary,
                  borderRadius: 14,
                  padding: 20,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.bold,
                    fontSize: 14,
                    color: Colors.text,
                  }}
                >
                  {entry.title}
                </Text>
                <Text style={shared.bio}>{entry.text}</Text>
              </View>
            ))}
            {!entries.length && (
              <Text style={shared.bio}>
                {section === "reviews"
                  ? "Your saved ratings will appear here."
                  : "No notifications yet."}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
