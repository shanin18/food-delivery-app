import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { Colors, Fonts } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

export const profilePhoto = require('../../assets/images/profile-user.png');
export function useProfile() {
  const { session } = useAuth();
  const metadata = session?.user.user_metadata ?? {};
  return { name: metadata.full_name ?? metadata.name ?? 'Vishal Khadok', bio: metadata.bio ?? 'I love fast food', phone: metadata.contact_phone ?? '', email: session?.user.email ?? '', avatar: metadata.avatar_url ? { uri: metadata.avatar_url } : profilePhoto };
}
export function ProfileHeader({ title, action }: { title: string; action?: ReactNode }) { return <View style={profileStyles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.canGoBack() ? router.back() : router.replace('/home')} style={profileStyles.back}><Ionicons name="chevron-back" size={22} color={Colors.text} /></Pressable><Text style={profileStyles.headerTitle}>{title}</Text><View style={{ flex: 1 }} />{action}</View>; }
export function ProfileSummary() { const profile = useProfile(); return <View style={profileStyles.summary}><Image source={profile.avatar} style={profileStyles.avatar} /><View style={{ flex: 1 }}><Text style={profileStyles.name}>{profile.name}</Text><Text style={profileStyles.bio}>{profile.bio}</Text></View></View>; }
export const profileStyles = StyleSheet.create({ screen: { flex: 1, backgroundColor: Colors.white }, header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 24 }, back: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }, headerTitle: { fontFamily: Fonts.regular, fontSize: 18, color: Colors.text }, content: { paddingHorizontal: 24, paddingBottom: 24 }, summary: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 28 }, avatar: { width: 88, height: 88, borderRadius: 44 }, name: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.text }, bio: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.imagePlaceholder, marginTop: 8, lineHeight: 20 }, button: { backgroundColor: Colors.primary, borderRadius: 12, padding: 22, alignItems: 'center' }, buttonText: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.white }, bottom: { padding: 24 }, error: { color: Colors.error, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 22, marginBottom: 12 }, edit: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.primary, textDecorationLine: 'underline' } });
