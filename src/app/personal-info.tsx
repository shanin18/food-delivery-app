import { ProfileHeader, ProfileSummary, profileStyles as shared, useProfile } from '@/components/profile-ui';
import { Colors, Fonts } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function PersonalInfoScreen() {
  const profile = useProfile();
  return <SafeAreaView style={shared.screen}><ProfileHeader title="Personal Info" action={<Pressable accessibilityRole="button" onPress={() => router.push('/edit-profile')}><Text style={shared.edit}>EDIT</Text></Pressable>} /><ScrollView contentContainerStyle={shared.content}><ProfileSummary /><View style={{ backgroundColor: Colors.surfaceSecondary, borderRadius: 16, padding: 20, gap: 24 }}>{([{ label: 'FULL NAME', value: profile.name, icon: 'person-outline', color: Colors.primary }, { label: 'EMAIL', value: profile.email, icon: 'mail-outline', color: '#735CFF' }, { label: 'PHONE NUMBER', value: profile.phone || 'Add your phone number', icon: 'call-outline', color: '#2A9BFF' }] as const).map(field => <View key={field.label} style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}><Ionicons name={field.icon} size={22} color={field.color} /><View style={{ flex: 1 }}><Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.text }}>{field.label}</Text><Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary, marginTop: 6 }}>{field.value}</Text></View></View>)}</View></ScrollView></SafeAreaView>;
}
