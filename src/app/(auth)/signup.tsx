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

const SignupScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      console.log("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    console.log({
      name,
      email,
      password,
    });

    // Firebase/API signup will go here later.
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
          <ImageBackground
            source={require("../../../assets/images/auth-bg.png")}
            style={styles.header}
            contentFit="cover"
            contentPosition={{ top: 0, left: 0 }}
          >
            <Pressable
              style={styles.backButton}
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

            <Text style={styles.title}>Sign Up</Text>

            <Text style={styles.subtitle}>Please sign up to get started</Text>
          </ImageBackground>

          <View style={styles.formContainer}>
            <Text style={styles.label}>NAME</Text>

            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={Colors.imagePlaceholder}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              value={name}
              onChangeText={setName}
            />

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

            <Text style={styles.label}>PASSWORD</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={Colors.imagePlaceholder}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                value={password}
                onChangeText={setPassword}
              />

              <Pressable
                style={styles.passwordToggle}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={21}
                  color={Colors.imagePlaceholder}
                />
              </Pressable>
            </View>

            <Text style={[styles.label, styles.passwordLabel]}>
              RE-TYPE PASSWORD
            </Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={Colors.imagePlaceholder}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <Pressable
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={21}
                  color={Colors.imagePlaceholder}
                />
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSignup}
            >
              <Text style={styles.buttonText}>SIGN UP</Text>
            </Pressable>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>

              <Pressable onPress={() => router.replace("/login")}>
                {({ pressed }) => (
                  <Text
                    style={[
                      styles.loginLink,
                      pressed && styles.loginLinkPressed,
                    ]}
                  >
                    LOG IN
                  </Text>
                )}
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
    borderRadius: "50%",
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
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
    paddingTop: 24,
    paddingBottom: 80,
  },

  label: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.text,
    marginBottom: 8,
  },

  passwordLabel: {
    marginTop: 24,
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

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 28,
  },

  loginText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  loginLink: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.primary,
  },

  loginLinkPressed: {
    textDecorationLine: "underline",
    opacity: 0.7,
  },
});

export default SignupScreen;
