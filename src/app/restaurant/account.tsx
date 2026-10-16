import { ProfileHeader, ProfileSummary, profileStyles as shared } from '@/components/profile-ui';
import { RestaurantNavigation } from '@/components/restaurant-navigation';
import { useRestaurant } from '@/providers/restaurant-provider';
import { getSupabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function RestaurantAccountScreen() { const { account } = useRestaurant(); const [error,setError] = useState<string | null>(null); return <SafeAreaView style={shared.screen}><ProfileHeader title="Restaurant Account" /><ScrollView contentContainerStyle={shared.content}><ProfileSummary /><Text style={shared.name}>{account.restaurant_name}</Text><Text style={shared.bio}>{account.location}</Text><Pressable accessibilityRole="button" style={{ paddingVertical: 24 }} onPress={() => router.push('/edit-profile')}><Text style={shared.edit}>EDIT PERSONAL DETAILS</Text></Pressable><Pressable accessibilityRole="button" style={shared.button} onPress={() => { void getSupabase().auth.signOut().then(result => { if (result.error) setError(result.error.message); else router.replace('/owner-login'); }); }}><Text style={shared.buttonText}>LOG OUT</Text></Pressable>{error && <Text style={shared.error}>{error}</Text>}</ScrollView><RestaurantNavigation /></SafeAreaView>; }
