import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { useAppDialog } from '@/providers/dialog-provider';
import { ProfileHeader, ProfileSummary, profileStyles as shared } from '@/components/profile-ui';
import { Colors, Fonts } from '@/constants/theme';
import { getSupabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
type MenuItem = { title: string; icon: keyof typeof Ionicons.glyphMap; color: string; route: Href };
const groups: MenuItem[][] = [
  [{ title: 'Personal Info', icon: 'person-outline', color: Colors.primary, route: '/personal-info' }, { title: 'Addresses', icon: 'map-outline', color: '#856BFF', route: '/addresses' }],
  [{ title: 'My Orders', icon: 'receipt-outline', color: '#2699FF', route: '/my-orders' }, { title: 'Cart', icon: 'bag-handle-outline', color: '#2699FF', route: '/cart' }, { title: 'Favourite', icon: 'heart-outline', color: '#B765ED', route: '/favorites' }, { title: 'Notifications', icon: 'notifications-outline', color: '#F4AE2A', route: { pathname: '/profile-section', params: { section: 'notifications' } } }, { title: 'Payment Method', icon: 'card-outline', color: '#2699FF', route: '/payment' }],
  [{ title: 'FAQs', icon: 'help-circle-outline', color: Colors.primary, route: { pathname: '/profile-section', params: { section: 'faq' } } }, { title: 'User Reviews', icon: 'star-outline', color: '#28C5CD', route: { pathname: '/profile-section', params: { section: 'reviews' } } }, { title: 'Settings', icon: 'settings-outline', color: '#7C6EEB', route: { pathname: '/profile-section', params: { section: 'settings' } } }],
];
export default function ProfileScreen() {
 const dialog = useAppDialog();
  const [error, setError] = useState<string | null>(null);
  const logout = () => dialog.alert('Log out?', 'You can sign in again at any time.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log Out', onPress: () => { void getSupabase().auth.signOut().then(result => { if (result.error) setError(result.error.message); else router.replace('/login'); }); } }]);
  return <SafeAreaView style={shared.screen}><ProfileHeader title="Profile" /><ScrollView contentContainerStyle={shared.content}><ProfileSummary />{groups.map((group, index) => <View key={index} style={{ backgroundColor: Colors.surfaceSecondary, borderRadius: 16, marginBottom: 20, paddingHorizontal: 16 }}>{group.map(item => <Pressable feedback="row" key={item.title} accessibilityRole="button" onPress={() => router.push(item.route)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 }}><View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={item.icon} size={19} color={item.color} /></View><Text style={{ flex: 1, fontFamily: Fonts.regular, fontSize: 14, color: Colors.text }}>{item.title}</Text><Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} /></Pressable>)}</View>)}<Pressable accessibilityRole="button" onPress={logout} style={{ backgroundColor: Colors.surfaceSecondary, borderRadius: 16, padding: 20, flexDirection: 'row', gap: 16, alignItems: 'center' }}><Ionicons name="log-out-outline" size={22} color={Colors.error} /><Text style={{ fontFamily: Fonts.regular, color: Colors.text }}>Log Out</Text></Pressable>{error && <Text style={shared.error}>{error}</Text>}</ScrollView></SafeAreaView>;
}
