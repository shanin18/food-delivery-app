import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LocationAccessScreen = () => {
  const handleLocationAccess = async () => {
    console.log("Request location permission");

    // We'll connect expo-location here.
    //
    // After permission is granted:
    // router.replace("/home");
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom", "left", "right"]}
    >
      <View style={styles.card}>
        <View style={styles.content}>
          {/* Temporary placeholder for the Figma illustration */}
          <View style={styles.illustrationPlaceholder} />
        </View>

        <View style={styles.bottomContent}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleLocationAccess}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>ACCESS LOCATION</Text>

            <View style={styles.locationIcon}>
              <Ionicons
                name="location-outline"
                size={13}
                color={Colors.white}
              />
            </View>
          </Pressable>

          <Text style={styles.description}>
            DFOOD WILL ACCESS YOUR LOCATION{"\n"}
            ONLY WHILE USING THE APP
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  card: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 48,
  },

  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
  },

  illustrationPlaceholder: {
    width: 120,
    height: 145,
    borderRadius: 60,
    backgroundColor: Colors.imagePlaceholder,
  },

  bottomContent: {
    width: "100%",
  },

  button: {
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
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

  locationIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },

  description: {
    marginTop: 30,
    paddingHorizontal: 12,

    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,

    textAlign: "center",
  },
});

export default LocationAccessScreen;
