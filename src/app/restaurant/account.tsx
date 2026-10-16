import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { useAppDialog } from '@/providers/dialog-provider';
import { Colors, Fonts } from '@/constants/theme';
import { useRestaurant } from '@/providers/restaurant-provider';
import { getSupabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function RestaurantAccountScreen() {
 const dialog = useAppDialog();
 const { balance, orders } = useRestaurant();
 const [busy, setBusy] = useState(false);
 const open = (section: string) => router.push({ pathname: '/restaurant/profile-section', params: { section } });
 const logout = () => dialog.alert('Log out?', 'You can sign back in with your restaurant account.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log out', onPress: async () => { setBusy(true); try { const { error } = await getSupabase().auth.signOut(); if (error) throw error; router.replace('/owner-login'); } catch { dialog.alert('Could not log out', 'Please try again.'); } finally { setBusy(false); } } }]);
 const groups = [
 [{ label: 'Personal Info', icon: 'person-outline', color: '#FF7622', action: () => router.push('/personal-info') }, { label: 'Settings', icon: 'settings-outline', color: '#6954FF', action: () => open('settings') }],
 [{ label: 'Withdrawal History', icon: 'wallet-outline', color: '#FF7622', action: () => open('withdrawals') }, { label: 'Number of Orders', icon: 'receipt-outline', color: '#22BFD8', value: String(orders.length), action: () => open('orders') }],
 [{ label: 'User Reviews', icon: 'chatbubbles-outline', color: '#00C4CC', action: () => router.push('/restaurant/reviews') }],
 [{ label: busy ? 'Logging out...' : 'Log Out', icon: 'log-out-outline', color: '#FF5252', action: logout }],
 ];
 return <SafeAreaView style={styles.safe} edges={['left','right','bottom']}><ScrollView showsVerticalScrollIndicator={false}>
 <SafeAreaView edges={['top']} style={styles.hero}><View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back to dashboard" style={styles.back} onPress={() => router.navigate('/restaurant/dashboard')}><Ionicons name="chevron-back" size={22} color={Colors.text} /></Pressable><Text style={styles.heading}>My Profile</Text></View><View style={styles.balance}><Text style={styles.heading}>Available Balance</Text><Text style={styles.amount}>${balance.toFixed(2)}</Text><Pressable accessibilityRole="button" disabled={balance <= 0} onPress={() => router.push('/restaurant/withdraw')} style={[styles.withdraw, balance <= 0 && { opacity: 0.5 }]}><Text style={styles.heading}>Withdraw</Text></Pressable></View></SafeAreaView>
 <View style={styles.content}>{groups.map((group,index) => <View key={index} style={styles.group}>{group.map(item => <Pressable feedback="row" key={item.label} accessibilityRole="button" disabled={busy} onPress={item.action} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}><View style={styles.icon}><Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={23} color={item.color} /></View><Text style={styles.label}>{item.label}</Text>{'value' in item ? <Text style={styles.count}>{item.value}</Text> : <Ionicons name="chevron-forward" size={17} color={Colors.textSecondary} />}</Pressable>)}</View>)}</View>
 </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({ safe:{flex:1,backgroundColor:Colors.white},hero:{backgroundColor:Colors.primary,borderBottomLeftRadius:28,borderBottomRightRadius:28},header:{flexDirection:'row',alignItems:'center',gap:16,padding:24},back:{width:44,height:44,borderRadius:22,backgroundColor:Colors.white,alignItems:'center',justifyContent:'center'},heading:{fontFamily:Fonts.regular,fontSize:14,color:Colors.white},balance:{alignItems:'center',paddingBottom:28,gap:8},amount:{fontFamily:Fonts.bold,fontSize:36,color:Colors.white},withdraw:{borderWidth:1,borderColor:Colors.white,borderRadius:9,paddingHorizontal:18,paddingVertical:10,marginTop:8},content:{padding:24,gap:16},group:{backgroundColor:'#F6F6F7',borderRadius:18,paddingHorizontal:16,paddingVertical:8},row:{flexDirection:'row',alignItems:'center',gap:14,minHeight:64},icon:{width:44,height:44,borderRadius:22,backgroundColor:Colors.white,alignItems:'center',justifyContent:'center'},label:{flex:1,fontFamily:Fonts.regular,fontSize:14,color:Colors.text},count:{fontFamily:Fonts.bold,color:Colors.textSecondary}});
