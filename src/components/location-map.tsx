import { Colors } from "@/constants/theme";
import { locationMapUrl, type Coordinates } from "@/lib/location-map";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { WebView } from "react-native-webview";

type LocationMapProps = {
  coordinates: Coordinates | null;
  zoom?: number;
};

export default function LocationMap({
  coordinates,
  zoom = 17,
}: LocationMapProps) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const mapUrl = locationMapUrl(coordinates, zoom);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        key={`${mapUrl}-${attempt}`}
        source={{ uri: mapUrl }}
        style={{
          flex: 1,
          backgroundColor: Colors.surfaceSecondary,
        }}
        originWhitelist={["https://www.openstreetmap.org"]}
        onShouldStartLoadWithRequest={({ url }) =>
          url.startsWith("https://www.openstreetmap.org/")
        }
        geolocationEnabled={false}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            color={Colors.primary}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
            }}
          />
        )}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
      />

      {failed && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: Colors.surfaceSecondary,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
            gap: 16,
          }}
        >
          <Text
            style={{
              color: Colors.textSecondary,
              textAlign: "center",
            }}
          >
            Map unavailable. You can still save your location.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setFailed(false);
              setAttempt((value) => value + 1);
            }}
          >
            <Text style={{ color: Colors.primary }}>Reload map</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
