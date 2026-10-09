import { FontAssets } from "@/constants/theme";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { ActivityIndicator, View } from 'react-native';

const RootNavigator = () => {
  const [fontsLoaded] = useFonts(FontAssets);
  const { session, loading } = useAuth();

  if (!fontsLoaded || loading) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  }

  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="(auth)" />
    <Stack.Screen name="auth-callback" />
    <Stack.Protected guard={!session}><Stack.Screen name="onboarding" /></Stack.Protected>
    <Stack.Protected guard={!!session}><Stack.Screen name="home" /><Stack.Screen name="search" /></Stack.Protected>
  </Stack>;
};

const RootLayout = () => <AuthProvider><RootNavigator /></AuthProvider>;
export default RootLayout;
