import { useReducedMotion } from 'react-native-reanimated';
import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { getRestaurantAccount } from '@/lib/restaurant-account';
import { RestaurantProvider } from '@/providers/restaurant-provider';
import { useAuth } from '@/providers/auth-provider';
import { Colors, Fonts } from '@/constants/theme';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
export default function RestaurantLayout() {
 const reducedMotion = useReducedMotion();
  const { session } = useAuth();
  const [access, setAccess] = useState<{ userId: string; account: { restaurant_name: string; location: string } | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const userId = session?.user.id;
  useEffect(() => { let active = true; void getRestaurantAccount().then(account => { if (active && userId) { setAccess({ userId, account }); setError(null); } }).catch(cause => { if (active) setError(cause.message); }); return () => { active = false; }; }, [userId, attempt]);
  if (error || (access?.userId === userId && access && !access.account)) return <View style={{ flex: 1, padding: 32, justifyContent: 'center', gap: 20, backgroundColor: Colors.white }}><Text style={{ fontFamily: Fonts.regular, color: Colors.text }}>{error ?? 'This account does not have restaurant owner access.'}</Text><Pressable accessibilityRole="button" onPress={() => { setError(null); setAttempt(value => value + 1); }}><Text style={{ color: Colors.primary }}>Retry access check</Text></Pressable><Pressable accessibilityRole="button" onPress={() => router.replace('/owner-login')}><Text style={{ color: Colors.primary }}>Restaurant owner sign-in</Text></Pressable></View>;
  if (!access || access.userId !== userId || !access.account) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={Colors.primary} /></View>;
  return <RestaurantProvider key={userId} account={access.account}><Stack screenOptions={{ headerShown: false, animation: reducedMotion ? 'none' : 'slide_from_right', animationDuration: 240 }} /></RestaurantProvider>;
}
