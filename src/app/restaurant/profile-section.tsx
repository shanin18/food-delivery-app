import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { ProfileHeader, ProfileSummary, profileStyles as shared } from '@/components/profile-ui';
import { Colors, Fonts } from '@/constants/theme';
import { useRestaurant } from '@/providers/restaurant-provider';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function RestaurantProfileSection(){
 const {section}=useLocalSearchParams<{section:string}>();const {withdrawals,orders,account}=useRestaurant();
 const title=section==='withdrawals'?'Withdrawal History':section==='orders'?'Number of Orders':'Settings';
 return <SafeAreaView style={shared.screen}><ProfileHeader title={title}/><ScrollView contentContainerStyle={shared.content}>
 {section==='withdrawals'?withdrawals.length?withdrawals.map(item=><View key={item.id} style={{paddingVertical:20,borderBottomWidth:1,borderBottomColor:Colors.border, gap:8}}><Text style={shared.name}>${item.amount.toFixed(2)}</Text><Text style={shared.bio}>{new Date(item.createdAt).toLocaleString()}</Text><Text style={{color:Colors.primary,fontFamily:Fonts.medium}}>Completed</Text></View>):<Text style={shared.bio}>No withdrawals yet.</Text>:section==='orders'?<><Text style={[shared.name,{marginBottom:24}]}>{orders.length} total orders</Text>{(['requested','running','completed','cancelled'] as const).map(status=><View key={status} style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:20,borderBottomWidth:1,borderBottomColor:Colors.border}}><Text style={{fontFamily:Fonts.regular,color:Colors.text,textTransform:'capitalize'}}>{status}</Text><Text style={shared.name}>{orders.filter(order=>order.status===status).length}</Text></View>)}</>:<><ProfileSummary/><Text style={shared.name}>{account.restaurant_name}</Text><Text style={shared.bio}>{account.location}</Text><Text style={[shared.bio,{marginTop:24,marginBottom:24}]}>Manage your account name, photo and contact details.</Text><Pressable accessibilityRole="button" style={shared.button} onPress={()=>router.push('/edit-profile')}><Text style={shared.buttonText}>EDIT PERSONAL DETAILS</Text></Pressable></>}
 </ScrollView></SafeAreaView>;
}
