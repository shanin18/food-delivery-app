import { ButtonContent } from "@/components/button-content";
import { Colors, Fonts } from "@/constants/theme";
import { AuthFeedback } from '@/components/auth-feedback';
import { useAuthAction } from '@/hooks/use-auth-action';
import { normalizeEmail, socialSignIn } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
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

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { busy, activeAction, error, run } = useAuthAction();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => run(async () => {
    const normalizedEmail = normalizeEmail(email);
    if (!password) throw new Error('Enter your password.');
    const { error } = await getSupabase().auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) throw error;
    router.replace('/home');
  });

  const handleFacebookLogin = () => {
    void run(async () => { if (await socialSignIn('facebook')) router.replace('/home'); }, 'facebook');
  };

  const handleTwitterLogin = () => {
    void run(async () => { if (await socialSignIn('twitter')) router.replace('/home'); }, 'twitter');
  };

  const handleAppleLogin = () => {
    void run(async () => { if (await socialSignIn('apple')) router.replace('/home'); }, 'apple');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
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
          {/* =========================
              HEADER
          ========================== */}

          <ImageBackground
            source={require("../../../assets/images/auth-bg.png")}
            style={styles.header}
            contentFit="cover"
            contentPosition={{ top: 0, left: 0 }}
          >
            <Text style={styles.title}>Log In</Text>

            <Text style={styles.subtitle}>
              Please sign in to your existing account
            </Text>
          </ImageBackground>

          {/* =========================
              FORM
          ========================== */}

          <View style={styles.formContainer}>
            <AuthFeedback error={error} />
            {/* Email */}

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
            />

            {/* Password */}

            <Text style={styles.label}>PASSWORD</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={Colors.imagePlaceholder}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                value={password}
                onChangeText={setPassword}
              />

              <Pressable
                style={styles.passwordToggle}
                onPress={() => setShowPassword((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={21}
                  color={Colors.imagePlaceholder}
                />
              </Pressable>
            </View>

            {/* =========================
                REMEMBER / FORGOT
            ========================== */}

            <View style={styles.options}>
              <Text style={styles.rememberText}>Stay signed in securely</Text>

              <Pressable
                onPress={() => router.push("/forgot-password")}
                accessibilityRole="button"
              >
                {({ pressed }) => (
                  <Text
                    style={[
                      styles.forgotPassword,
                      pressed && styles.linkPressed,
                    ]}
                  >
                    Forgot Password
                  </Text>
                )}
              </Pressable>
            </View>

            {/* =========================
                LOGIN BUTTON
            ========================== */}

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.loginButtonPressed,
              ]}
              onPress={handleLogin}
              disabled={busy}
              accessibilityRole="button"
            >
              <ButtonContent busy={busy && activeAction === "submit"}><Text style={styles.loginButtonText}>LOG IN</Text></ButtonContent>
            </Pressable>

            {/* =========================
                SIGN UP
            ========================== */}

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don&apos;t have an account?</Text>

              <Pressable
                onPress={() => router.push("/signup")}
                accessibilityRole="button"
              >
                {({ pressed }) => (
                  <Text
                    style={[styles.signupLink, pressed && styles.linkPressed]}
                  >
                    SIGN UP
                  </Text>
                )}
              </Pressable>
            </View>

            {/* =========================
                OR
            ========================== */}

            <Text style={styles.orText}>Or</Text>

            {/* =========================
                SOCIAL LOGIN
            ========================== */}

            <View style={styles.socialButtons}>
              {/* Facebook */}

              <Pressable
                style={({ pressed }) => [
                  styles.socialButton,
                  styles.facebookButton,
                  pressed && styles.socialButtonPressed,
                ]}
                onPress={handleFacebookLogin}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel="Continue with Facebook"
              >
                <ButtonContent busy={busy && activeAction === "facebook"}><FontAwesome name="facebook" size={22} color="#FFFFFF" /></ButtonContent>
              </Pressable>

              {/* Twitter */}

              <Pressable
                style={({ pressed }) => [
                  styles.socialButton,
                  styles.twitterButton,
                  pressed && styles.socialButtonPressed,
                ]}
                onPress={handleTwitterLogin}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel="Continue with Twitter"
              >
                <ButtonContent busy={busy && activeAction === "twitter"}><FontAwesome name="twitter" size={22} color="#FFFFFF" /></ButtonContent>
              </Pressable>

              {/* Apple */}

              <Pressable
                style={({ pressed }) => [
                  styles.socialButton,
                  styles.appleButton,
                  pressed && styles.socialButtonPressed,
                ]}
                onPress={handleAppleLogin}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel="Continue with Apple"
              >
                <ButtonContent busy={busy && activeAction === "apple"}><AntDesign name="apple" size={22} color="#FFFFFF" /></ButtonContent>
              </Pressable>
            </View>
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

  // =========================
  // Header
  // =========================

  // Height comes from the content + padding, so change the padding freely.
  // The image fills the header and stays pinned to the top-left.
  header: {
    // Shows only where the PNG doesn't cover
    backgroundColor: Colors.darkBackground,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 50,
    paddingTop: 118,
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

  // =========================
  // Form
  // =========================

  formContainer: {
    flexGrow: 1,

    backgroundColor: Colors.background,

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    paddingHorizontal: 24,
    paddingTop: 24,
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
    marginBottom: 24,
  },

  // =========================
  // Password
  // =========================

  passwordContainer: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceSecondary,

    borderRadius: 10,
  },

  passwordInput: {
    flex: 1,
    height: "100%",

    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
  },

  passwordToggle: {
    width: 44,
    height: 44,

    justifyContent: "center",
    alignItems: "center",
  },

  // =========================
  // Remember / Forgot
  // =========================

  options: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginTop: 18,
    marginBottom: 28,
  },

  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  checkbox: {
    width: 20,
    height: 20,

    borderWidth: 1,
    borderColor: Colors.imagePlaceholder,
    borderRadius: 5,

    justifyContent: "center",
    alignItems: "center",
  },

  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  rememberText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },

  forgotPassword: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.primary,
  },

  linkPressed: {
    opacity: 0.7,
    textDecorationLine: "underline",
  },

  // =========================
  // Login
  // =========================

  loginButton: {
    width: "100%",
    padding: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  loginButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  loginButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.white,
  },

  // =========================
  // Signup
  // =========================

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    gap: 6,

    marginTop: 28,
  },

  signupText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  signupLink: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.primary,
  },

  // =========================
  // OR
  // =========================

  orText: {
    textAlign: "center",

    marginTop: 22,
    marginBottom: 20,

    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // =========================
  // Social
  // =========================

  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    gap: 22,
  },

  socialButton: {
    width: 54,
    height: 54,

    borderRadius: 27,

    justifyContent: "center",
    alignItems: "center",
  },

  facebookButton: {
    backgroundColor: "#395998",
  },

  twitterButton: {
    backgroundColor: "#169CE8",
  },

  appleButton: {
    backgroundColor: "#1B1F2A",
  },

  socialButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.94 }],
  },
});

export default LoginScreen;
