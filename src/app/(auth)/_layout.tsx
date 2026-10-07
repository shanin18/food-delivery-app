import { useAuth } from '@/providers/auth-provider';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  const { session } = useAuth();
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Protected guard={!session}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
    </Stack.Protected>
    <Stack.Screen name="verification" />
    <Stack.Protected guard={!!session}>
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="location-access" />
    </Stack.Protected>
  </Stack>;
}
