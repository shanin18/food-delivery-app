import { ButtonContent } from "@/components/button-content";
import { AuthFeedback } from "@/components/auth-feedback";
import LocationMap from "@/components/location-map";
import { Colors, Fonts } from "@/constants/theme";
import { useAuthAction } from "@/hooks/use-auth-action";
import type { Coordinates } from "@/lib/location-map";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LocationAccessScreen = () => {
  const { session } = useAuth();
  const { busy, activeAction, error, run } = useAuthAction();

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [phase, setPhase] = useState<"locating" | "saving" | null>(null);

  // =========================
  // Find current location
  // =========================

  const handleLocationAccess = () =>
    run(async () => {
      if (!session) {
        throw new Error("Please sign in again.");
      }

      setPhase("locating");

      try {
        const servicesEnabled = await Location.hasServicesEnabledAsync();

        if (!servicesEnabled) {
          throw new Error(
            "Turn on your device location services and try again.",
          );
        }

        const permission = await Location.requestForegroundPermissionsAsync();

        if (permission.status !== "granted") {
          throw new Error(
            "Location access was denied. You can skip this step or enable it later in Settings.",
          );
        }

        let timeout: ReturnType<typeof setTimeout> | undefined;
        let location: Location.LocationObject;

        try {
          location = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }),

            new Promise<never>((_, reject) => {
              timeout = setTimeout(() => {
                reject(
                  new Error(
                    "Finding your location took too long. Move near a window or outdoors and try again.",
                  ),
                );
              }, 30000);
            }),
          ]);
        } finally {
          if (timeout) {
            clearTimeout(timeout);
          }
        }

        setCoordinates({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } finally {
        setPhase(null);
      }
    }, "locate");

  // =========================
  // Save location
  // =========================

  const handleSaveLocation = () =>
    run(async () => {
      if (!coordinates || !session) {
        throw new Error("Please find your location again.");
      }

      setPhase("saving");

      try {
        const { error } = await getSupabase().from("delivery_locations").upsert(
          {
            user_id: session.user.id,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          },
        );

        if (error) {
          if (__DEV__) {
            console.warn("Delivery location save failed:", error.code);
          }

          if (error.code === "PGRST205" || error.code === "42P01") {
            throw new Error(
              "Location saving is not available yet. You can skip this step and add your location later.",
            );
          }

          if (error.code === "42501") {
            throw new Error(
              "Your account could not save this location. Please sign in again. If it continues, contact support.",
            );
          }

          throw new Error(
            "Could not save your delivery location. Check your connection and try again.",
          );
        }

        router.replace("/home");
      } finally {
        setPhase(null);
      }
    });

  // =========================
  // Button text
  // =========================

  const getButtonText = () => {
    if (busy && !(coordinates && activeAction === "locate")) {
      return phase === "saving" ? "SAVING LOCATION…" : "FINDING LOCATION…";
    }

    return coordinates ? "SAVE & CONTINUE" : "ACCESS LOCATION";
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom", "left", "right"]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* =========================
            MAP
        ========================== */}

        <View style={styles.mapSection}>
          <View style={styles.mapContainer}>
            <LocationMap coordinates={coordinates} zoom={20} />
          </View>
        </View>

        {/* =========================
            BOTTOM CONTENT
        ========================== */}

        <View style={styles.bottomContent}>
          <AuthFeedback error={error} />

          {/* Main button */}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && !busy && styles.buttonPressed,
              busy && styles.buttonDisabled,
            ]}
            onPress={coordinates ? handleSaveLocation : handleLocationAccess}
            disabled={busy}
            accessibilityRole="button"
          >
            <ButtonContent busy={busy && !(coordinates && activeAction === "locate")}>
              <Text style={styles.buttonText}>{getButtonText()}</Text>
              <View style={styles.locationIcon}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={Colors.white}
                />
              </View>
            </ButtonContent>
          </Pressable>

          {/* Refresh */}

          {coordinates && (
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={handleLocationAccess}
              style={styles.refreshButton}
            >
              {({ pressed }) => (
                <ButtonContent busy={busy && activeAction === "locate"} color={Colors.primary}><Text
                  style={[
                    styles.refreshText,
                    pressed && styles.linkPressed,
                    busy && styles.disabledText,
                  ]}
                >
                  Refresh my location
                </Text></ButtonContent>
              )}
            </Pressable>
          )}

          {/* Description */}

          <Text style={styles.description}>
            DFOOD WILL ACCESS YOUR LOCATION ONLY WHILE USING THE APP
          </Text>

          {/* Skip */}

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => router.replace("/home")}
            style={styles.skipButton}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.skipText,
                  pressed && styles.linkPressed,
                  busy && styles.disabledText,
                ]}
              >
                Skip for now
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // =========================
  // Screen
  // =========================

  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },

  // =========================
  // Map
  // =========================

  mapSection: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },

  mapContainer: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: "hidden",
    backgroundColor: Colors.surfaceSecondary,
  },

  // =========================
  // Bottom content
  // =========================

  bottomContent: {
    width: "100%",
  },

  // =========================
  // Main button
  // =========================

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

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.white,
    textAlign: "center",
  },

  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    borderColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF914E",
  },

  // =========================
  // Refresh
  // =========================

  refreshButton: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  refreshText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.primary,
  },

  // =========================
  // Description
  // =========================

  description: {
    marginTop: 28,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // =========================
  // Skip
  // =========================

  skipButton: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 4,
  },

  skipText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.textSecondary,
  },

  linkPressed: {
    opacity: 0.7,
    textDecorationLine: "underline",
  },

  disabledText: {
    opacity: 0.5,
  },
});

export default LocationAccessScreen;
