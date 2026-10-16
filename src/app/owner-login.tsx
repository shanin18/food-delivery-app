import { ButtonContent } from '@/components/button-content';
import { ProfileHeader, profileStyles as shared } from '@/components/profile-ui';
import { Colors, Fonts } from '@/constants/theme';
import { getSupabase } from '@/lib/supabase';
import { getRestaurantAccount } from '@/lib/restaurant-account';
import { useAuth } from '@/providers/auth-provider';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function OwnerLoginScreen() {
  const { session } = useAuth();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  const login = async () => { if (busy) return; setBusy(true); setError(null); try { const result = await getSupabase().auth.signInWithPassword({ email: email.trim(), password }); if (result.error) throw result.error; const account = await getRestaurantAccount(); if (!account) { await getSupabase().auth.signOut(); throw new Error('Use an approved restaurant owner account to sign in here.'); } router.replace('/restaurant/dashboard'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to sign in.'); } finally { setBusy(false); } };
  return <SafeAreaView style={shared.screen}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ProfileHeader title="Restaurant Sign In" /><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={shared.content}><Text style={shared.name}>Manage your restaurant</Text><Text style={[shared.bio, { marginBottom: 28 }]}>Sign in with your restaurant owner account.</Text>{session && <Text style={shared.bio}>Signing in here switches the account used on this device.</Text>}{([{ label: 'EMAIL', value: email, change: setEmail }, { label: 'PASSWORD', value: password, change: setPassword }] as const).map(field => <View key={field.label}><Text style={{ fontFamily: Fonts.regular, color: Colors.text, fontSize: 12, marginVertical: 12 }}>{field.label}</Text><TextInput accessibilityLabel={field.label} value={field.value} onChangeText={field.change} autoCapitalize="none" keyboardType={field.label === 'EMAIL' ? 'email-address' : 'default'} secureTextEntry={field.label === 'PASSWORD'} style={{ backgroundColor: Colors.surfaceSecondary, padding: 20, borderRadius: 12 }} /></View>)}{error && <Text accessibilityRole="alert" style={shared.error}>{error}</Text>}</ScrollView><View style={shared.bottom}><Pressable accessibilityRole="button" disabled={busy} onPress={() => void login()} style={shared.button}><ButtonContent busy={busy}><Text style={shared.buttonText}>SIGN IN</Text></ButtonContent></Pressable></View></KeyboardAvoidingView></SafeAreaView>;
}
