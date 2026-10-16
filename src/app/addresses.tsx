import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { useAppDialog } from '@/providers/dialog-provider';
import { ProfileHeader, profileStyles as shared } from '@/components/profile-ui';
import { Colors, Fonts } from '@/constants/theme';
import { formatAddress } from '@/lib/addresses';
import { useAddresses } from '@/providers/address-provider';
import { useFood } from '@/providers/food-provider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function AddressesScreen() {
 const dialog = useAppDialog();
  const { addresses, loading, error, remove, select } = useAddresses();
  const { address } = useFood();
  const [actionError, setActionError] = useState<string | null>(null);
  const run = async (action: () => Promise<void>) => { try { await action(); setActionError(null); } catch { setActionError('Could not update your address. Please try again.'); } };
  return <SafeAreaView style={shared.screen}><ProfileHeader title="My Address" /><ScrollView contentContainerStyle={shared.content}>{(error || actionError) && <Text style={shared.error}>{error || actionError}</Text>}{loading && <Text style={shared.bio}>Loading addresses…</Text>}{addresses.map(value => <View key={value.id} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: Colors.surfaceSecondary, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: address === formatAddress(value) ? Colors.primary : Colors.transparent }}><Pressable accessibilityRole="button" accessibilityLabel={`Use ${value.label} address`} onPress={() => void run(() => select(value))} style={{ flexDirection: 'row', gap: 14, flex: 1 }}><Ionicons name={value.label === 'Home' ? 'home-outline' : value.label === 'Work' ? 'briefcase-outline' : 'location-outline'} size={24} color={value.label === 'Home' ? '#2699FF' : '#A951DB'} /><View style={{ flex: 1 }}><Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.text }}>{value.label.toUpperCase()}</Text><Text style={[shared.bio, { marginTop: 6 }]}>{formatAddress(value)}</Text></View></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Edit ${value.label} address`} hitSlop={8} onPress={() => router.push({ pathname: '/add-address', params: { id: value.id } })}><Ionicons name="create-outline" size={18} color={Colors.primary} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Delete ${value.label} address`} hitSlop={8} onPress={() => dialog.alert('Delete address?', 'Remove this saved address?', [{ text: 'Keep', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => void run(() => remove(value.id)) }])}><Ionicons name="trash-outline" size={18} color={Colors.primary} /></Pressable></View>)}{!loading && !addresses.length && <Text style={shared.bio}>Save your home or work address for faster checkout.</Text>}</ScrollView><View style={shared.bottom}><Pressable accessibilityRole="button" disabled={loading} style={shared.button} onPress={() => router.push('/add-address')}><Text style={shared.buttonText}>ADD NEW ADDRESS</Text></Pressable></View></SafeAreaView>;
}
