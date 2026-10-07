import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");

  const handleSendCode = () => {
    if (!email.trim()) {
      console.log("Email is required");
      return;
    }

    router.push({
      pathname: "/verification",
      params: { email },
    });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <ImageBackground
            source={require("../../../assets/images/auth-bg.png")}
            style={styles.header}
            contentFit="cover"
            contentPosition={{ top: 0, left: 0 }}
          >
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={Colors.imagePlaceholder}
              />
            </Pressable>

            <Text style={styles.title}>Forgot Password</Text>

            <Text style={styles.subtitle}>
              Please sign in to your existing account
            </Text>
          </ImageBackground>

          <View style={styles.formContainer}>
            <Text style={styles.label}>EMAIL</Text>

            <TextInput
              style={styles.input}
              placeholder="example@gmail.com"
              placeholderTextColor={Colors.imagePlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
              returnKeyType="send"
              onSubmitEditing={handleSendCode}
            />

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSendCode}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>SEND CODE</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },

  keyboardView: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  header: {
    backgroundColor: Colors.darkBackground,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 50,
  },

  backButton: {
    position: "absolute",
    top: 28,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },

  backButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.94 }],
  },

  title: {
    fontFamily: Fonts.bold,
    fontSize: 30,
    color: Colors.white,
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.white,
    textAlign: "center",
  },

  formContainer: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },

  label: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.text,
    marginBottom: 8,
  },

  input: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 22,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
  },

  button: {
    width: "100%",
    padding: 24,
    marginTop: 32,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  buttonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.white,
  },
});

export default ForgotPasswordScreen;