import { useReducedMotion } from 'react-native-reanimated';
import { DialogProvider } from '@/providers/dialog-provider';
import { AddressProvider } from "@/providers/address-provider";
import { PaymentProvider } from "@/providers/payment-provider";
import { FontAssets } from "@/constants/theme";
import { FoodProvider } from '@/providers/food-provider';
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { ActivityIndicator, View } from 'react-native';

const RootNavigator = () => {
  const reducedMotion = useReducedMotion();
  const [fontsLoaded] = useFonts(FontAssets);
  const { session, loading } = useAuth();

  if (!fontsLoaded || loading) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  }

  return <Stack screenOptions={{ headerShown: false, animation: reducedMotion ? 'none' : 'slide_from_right', animationDuration: 240 }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="(auth)" />
    <Stack.Screen name="auth-callback" /><Stack.Screen name="owner-login" />
    <Stack.Protected guard={!session}><Stack.Screen name="onboarding" /></Stack.Protected>
    <Stack.Protected guard={!!session}><Stack.Screen name="home" /><Stack.Screen name="restaurant" /><Stack.Screen name="search" /><Stack.Screen name="food-category" /><Stack.Screen name="food-details" /><Stack.Screen name="restaurant-details" /><Stack.Screen name="cart" /><Stack.Screen name="payment" /><Stack.Screen name="add-card" /><Stack.Screen name="payment-success" /><Stack.Screen name="order-tracking" /><Stack.Screen name="my-orders" /><Stack.Screen name="profile" /><Stack.Screen name="personal-info" /><Stack.Screen name="edit-profile" /><Stack.Screen name="addresses" /><Stack.Screen name="add-address" /><Stack.Screen name="favorites" /><Stack.Screen name="profile-section" /><Stack.Screen name="courier-call" /><Stack.Screen name="courier-message" /></Stack.Protected>
  </Stack>;
};

const RootLayout = () => <AuthProvider><FoodProvider><AddressProvider><PaymentProvider><DialogProvider><RootNavigator /></DialogProvider></PaymentProvider></AddressProvider></FoodProvider></AuthProvider>;
export default RootLayout;
