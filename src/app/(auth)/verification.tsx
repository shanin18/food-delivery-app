import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
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

const OTP_LENGTH = 4;
const RESEND_TIME = 50;

const VerificationScreen = () => {
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [code, setCode] = useState(["", "", "", ""]);
  const [seconds, setSeconds] = useState(RESEND_TIME);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const handleCodeChange = (value: string, index: number) => {
    const number = value.replace(/[^0-9]/g, "");

    if (!number && value) return;

    const updatedCode = [...code];

    updatedCode[index] = number.slice(-1);

    setCode(updatedCode);

    if (number && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (seconds > 0) return;

    console.log("Resend verification code");

    setCode(["", "", "", ""]);
    setSeconds(RESEND_TIME);

    inputRefs.current[0]?.focus();
  };

  const handleVerify = () => {
    const verificationCode = code.join("");

    if (verificationCode.length !== OTP_LENGTH) {
      console.log("Please enter the complete code");
      return;
    }

    console.log({
      email,
      verificationCode,
    });

    // Actual verification API/Firebase logic later.
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={Colors.imagePlaceholder}
              />
            </Pressable>

            <Text style={styles.title}>Verification</Text>

            <Text style={styles.subtitle}>
              We have sent a code to your email{"\n"}
              <Text style={styles.email}>
                {email || "example@gmail.com"}
              </Text>
            </Text>
          </ImageBackground>

          <View style={styles.formContainer}>
            <View style={styles.codeHeader}>
              <Text style={styles.label}>CODE</Text>

              {seconds > 0 ? (
                <Text style={styles.resendTimer}>
                  Resend in{" "}
                  <Text style={styles.seconds}>{seconds}sec</Text>
                </Text>
              ) : (
                <Pressable onPress={handleResend}>
                  {({ pressed }) => (
                    <Text
                      style={[
                        styles.resendButton,
                        pressed && styles.resendPressed,
                      ]}
                    >
                      Resend
                    </Text>
                  )}
                </Pressable>
              )}
            </View>

            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={(value) =>
                    handleCodeChange(value, index)
                  }
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  textAlign="center"
                />
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleVerify}
            >
              <Text style={styles.buttonText}>VERIFY</Text>
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
    fontSize: 14,
    lineHeight: 21,
    color: Colors.white,
    textAlign: "center",
  },

  email: {
    fontFamily: Fonts.bold,
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

  codeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  label: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.text,
  },

  resendTimer: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.text,
  },

  seconds: {
    fontFamily: Fonts.bold,
    color: Colors.text,
    textDecorationLine: "underline",
  },

  resendButton: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.primary,
  },

  resendPressed: {
    opacity: 0.7,
    textDecorationLine: "underline",
  },

  codeContainer: {
    flexDirection: "row",
    gap: 12,
  },

  codeInput: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 72,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,

    fontFamily: Fonts.bold,
    fontSize: 18,
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

export default VerificationScreen;