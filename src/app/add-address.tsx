import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import AddressMap from "@/components/address-map";
import { ButtonContent } from "@/components/button-content";
import {
  ProfileHeader,
  profileStyles as shared,
} from "@/components/profile-ui";
import { Colors, Fonts } from "@/constants/theme";
import { parseGeocodedAddress, type SavedAddress } from "@/lib/addresses";
import type { Coordinates } from "@/lib/location-map";
import { useAddresses } from "@/providers/address-provider";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function AddAddressScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { addresses, save, loading } = useAddresses();
  const existing = addresses.find((value) => value.id === id);
  if (loading)
    return (
      <SafeAreaView style={shared.screen}>
        <ProfileHeader title="Address" />
        <ActivityIndicator color={Colors.primary} />
      </SafeAreaView>
    );
  if (id && !existing)
    return (
      <SafeAreaView style={shared.screen}>
        <ProfileHeader title="Address" />
        <Text style={shared.error}>Address not found.</Text>
      </SafeAreaView>
    );
  return <AddressForm existing={existing} key={id ?? "new"} save={save} />;
}
function AddressForm({
  existing,
  save,
}: {
  existing?: SavedAddress;
  save: (value: SavedAddress) => Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const [initial, setInitial] = useState<Coordinates | undefined>(
    existing
      ? { latitude: existing.latitude, longitude: existing.longitude }
      : undefined,
  );
  const [currentLocation, setCurrentLocation] = useState<
    Coordinates | undefined
  >();
  const [point, setPoint] = useState<Coordinates | null>(initial ?? null);
  const [address, setAddress] = useState(existing?.address ?? "");
  const [street, setStreet] = useState(existing?.street ?? "");
  const [postcode, setPostcode] = useState(existing?.postcode ?? "");
  const [apartment, setApartment] = useState(existing?.apartment ?? "");
  const [label, setLabel] = useState<SavedAddress["label"]>(
    existing?.label ?? "Home",
  );
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRequest = useRef(0);
  const [selection, setSelection] = useState<Coordinates | null>(null);
  const [locationRequest, setLocationRequest] = useState(0);
  const [findingCurrent, setFindingCurrent] = useState(!existing);
  const manuallySelected = useRef(false);
  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const locate = async () => {
      setFindingCurrent(true);
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted")
          throw new Error(
            "Allow location access to center the map on you, or move the map to choose an address.",
          );
        const location = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          new Promise<never>((_, reject) => {
            timeout = setTimeout(
              () =>
                reject(
                  new Error(
                    "Could not find your current location. Move the map to choose an address or try again.",
                  ),
                ),
              20000,
            );
          }),
        ]);
        if (active && !manuallySelected.current) {
          const coordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setCurrentLocation(coordinates);
          if (!existing || locationRequest > 0) {
            setInitial(coordinates);
            setPoint(coordinates);
            setSelection(coordinates);
            setLocating(true);
          }
          setError(null);
        }
      } catch (cause) {
        if (active && !manuallySelected.current)
          setError(
            cause instanceof Error
              ? cause.message
              : "Current location unavailable. Choose a point on the map.",
          );
      } finally {
        if (timeout) clearTimeout(timeout);
        if (active) setFindingCurrent(false);
      }
    };
    void locate();
    return () => {
      active = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [existing, locationRequest]);
  useEffect(() => {
    if (!selection) return;
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(
      async () => {
        lastRequest.current = Date.now();
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${selection.latitude}&lon=${selection.longitude}`;
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              "Accept-Language": "en",
              ...(Platform.OS !== "web"
                ? {
                    "User-Agent": "FoodDelivery/1.0 (mobile address selection)",
                  }
                : {}),
            },
          });
          if (!response.ok) throw new Error();
          const result = parseGeocodedAddress(await response.json());
          if (!result.address) throw new Error();
          if (active) {
            setAddress(result.address.slice(0, 260));
            setStreet(result.street);
            setPostcode(result.postcode);
            setError(null);
          }
        } catch {
          if (active)
            setError(
              "Could not find this address. Enter the details below or select another point.",
            );
        } finally {
          if (active) setLocating(false);
        }
      },
      Math.max(350, 1100 - (Date.now() - lastRequest.current)),
    );
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [selection]);
  const submit = async () => {
    if (busy || locating) return;
    setBusy(true);
    setError(null);
    try {
      if (!point)
        throw new Error("Tap the map to select your delivery location.");
      if (!address.trim()) throw new Error("Enter your address.");
      await save({
        id: existing?.id ?? `address-${Date.now()}`,
        label,
        address: address.trim(),
        street: street.trim(),
        postcode: postcode.trim(),
        apartment: apartment.trim(),
        latitude: point.latitude,
        longitude: point.longitude,
      });
      router.back();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save your address.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={shared.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.map, { height: 280 + insets.top }]}>
          <AddressMap
            topInset={insets.top}
            initial={initial}
            currentLocation={currentLocation}
            onSelect={(value) => {
              manuallySelected.current = true;
              setPoint(value);
              setSelection(value);
              setAddress("");
              setStreet("");
              setPostcode("");
              setLocating(true);
              setError(null);
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => router.back()}
            style={[styles.mapBack, { top: insets.top + 16 }]}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.white} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Use my current location"
            disabled={findingCurrent}
            onPress={() => {
              manuallySelected.current = false;
              setLocationRequest((value) => value + 1);
            }}
            style={styles.currentLocation}
          >
            {findingCurrent ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Ionicons name="locate" size={24} color={Colors.primary} />
            )}
          </Pressable>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={shared.content}
          keyboardShouldPersistTaps="handled"
        >
          {locating && <Text style={styles.hint}>Finding address…</Text>}
          <Text style={styles.label}>ADDRESS</Text>
          <TextInput
            accessibilityLabel="Address"
            value={address}
            onChangeText={setAddress}
            maxLength={260}
            multiline
            style={styles.input}
            placeholder="Select a map location or enter address"
          />
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>STREET</Text>
              <TextInput
                accessibilityLabel="Street"
                value={street}
                onChangeText={setStreet}
                maxLength={100}
                style={styles.input}
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>POST CODE</Text>
              <TextInput
                accessibilityLabel="Post code"
                value={postcode}
                onChangeText={setPostcode}
                maxLength={20}
                style={styles.input}
              />
            </View>
          </View>
          <Text style={styles.label}>APARTMENT</Text>
          <TextInput
            accessibilityLabel="Apartment"
            value={apartment}
            onChangeText={setApartment}
            maxLength={30}
            style={styles.input}
            placeholder="Apartment / floor / unit"
          />
          <Text style={styles.label}>LABEL AS</Text>
          <View style={styles.row}>
            {(["Home", "Work", "Other"] as const).map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: label === value }}
                onPress={() => setLabel(value)}
                style={[
                  styles.chip,
                  label === value && { backgroundColor: Colors.primary },
                ]}
              >
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    color: label === value ? Colors.white : Colors.text,
                  }}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
          {error && (
            <Text accessibilityRole="alert" style={shared.error}>
              {error}
            </Text>
          )}
        </ScrollView>
        <View style={shared.bottom}>
          <Pressable
            accessibilityRole="button"
            disabled={busy || locating}
            onPress={() => void submit()}
            style={shared.button}
          >
            <ButtonContent busy={busy || locating}>
              <Text style={shared.buttonText}>SAVE LOCATION</Text>
            </ButtonContent>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  map: { height: 320, width: "100%", marginBottom: 16, overflow: "hidden" },
  mapBack: {
    position: "absolute",
    top: 24,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.darkBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocation: {
    position: "absolute",
    bottom: 28,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 3px 12px rgba(18,18,35,0.12)",
  },
  hint: {
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 24,
  },
  label: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.text,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
  },
  row: { flexDirection: "row", gap: 16, marginBottom: 20 },
  column: { flex: 1 },
  chip: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    paddingVertical: 14,
    borderRadius: 24,
  },
});
