import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dismissal lasts for this app launch, including navigation away from Home.
let dismissedThisLaunch = false;

export function OfferPopup() {
  const [visible, setVisible] = useState(!dismissedThisLaunch);
  const dismiss = () => {
    dismissedThisLaunch = true;
    setVisible(false);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={dismiss} statusBarTranslucent navigationBarTranslucent>
      <SafeAreaView style={styles.backdrop}>
        <ScrollView contentContainerStyle={styles.center} bounces={false}>
          <View style={styles.dialog} accessibilityViewIsModal onAccessibilityEscape={dismiss}>
            <LinearGradient colors={["#E76F00", "#FFEB34"]} locations={[0, 1]} start={{ x: 1, y: 1 }} end={{ x: 0, y: 0 }} style={styles.card}>
              <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
                <Image source={require("../../assets/images/elements.png")} style={styles.elements} resizeMode="contain" accessible={false} />
              </View>
              <Text accessibilityRole="header" style={styles.title}>Hurry Offers!</Text>
              <Text selectable accessibilityLabel="Coupon code 1243CD2" style={styles.code}>#1243CD2</Text>
              <Text style={styles.description}>Use the coupon get 25% discount</Text>
              <Pressable accessibilityRole="button" onPress={dismiss} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
                <Text style={styles.buttonText}>GOT IT</Text>
              </Pressable>
            </LinearGradient>
            <Pressable accessibilityRole="button" accessibilityLabel="Close offer" onPress={dismiss} hitSlop={8} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
              <Ionicons name="close" size={22} color={Colors.primary} />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(45, 69, 88, 0.68)" },
  center: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24, paddingVertical: 32 },
  dialog: { width: "100%", maxWidth: 340 },
  card: { borderRadius: 32, overflow: "hidden", paddingHorizontal: 24, paddingTop: 88, paddingBottom: 28, alignItems: "center" },
  title: { fontFamily: Fonts.extraBold, fontSize: 36, color: Colors.white, textAlign: "center", marginBottom: 46 },
  code: { fontFamily: Fonts.extraBold, fontSize: 28, letterSpacing: 1, color: Colors.white, textAlign: "center", marginBottom: 30 },
  description: { fontFamily: Fonts.bold, fontSize: 16, lineHeight: 24, color: Colors.white, textAlign: "center", marginBottom: 30 },
  button: { width: "100%", minHeight: 60, padding: 16, borderWidth: 2, borderColor: Colors.white, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  buttonText: { fontFamily: Fonts.extraBold, fontSize: 14, color: Colors.white },
  close: { position: "absolute", top: -18, right: 0, width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFE69B", alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.75 },
  elements: { position: "absolute", top: 40, left: 24, right: 24, aspectRatio: 272 / 191 },
});
