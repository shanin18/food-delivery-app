import { ButtonContent } from "@/components/button-content";
import { Colors, Fonts } from "@/constants/theme";
import { AuthFeedback } from '@/components/auth-feedback';
import { useAuthAction } from '@/hooks/use-auth-action';
import { normalizeEmail } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
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

  const { busy, error, run } = useAuthAction();
  const handleSendCode = () => run(async () => {
    const normalizedEmail = normalizeEmail(email);
    const { error } = await getSupabase().auth.resetPasswordForEmail(normalizedEmail);
    if (error) throw error;
    router.push({
      pathname: "/verification",
      params: { email: normalizedEmail, type: 'recovery' },
    });
  });

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
              Enter your email to reset your password
            </Text>
          </ImageBackground>

          <View style={styles.formContainer}>
            <AuthFeedback error={error} />
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
              disabled={busy}
              accessibilityRole="button"
            >
              <ButtonContent busy={busy}><Text style={styles.buttonText}>SEND CODE</Text></ButtonContent>
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
    paddingTop: 118,
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
