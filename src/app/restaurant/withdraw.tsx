import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { useAppDialog } from '@/providers/dialog-provider';
import { ProfileHeader, profileStyles as shared } from '@/components/profile-ui';
import { Colors, Fonts } from '@/constants/theme';
import { useRestaurant } from '@/providers/restaurant-provider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function WithdrawScreen() {
 const dialog = useAppDialog();
 const { balance, withdraw } = useRestaurant(); const [success,setSuccess]=useState(false);
 return <SafeAreaView style={shared.screen}>{!success && <ProfileHeader title="Withdraw" />}<View style={styles.content}>{success ? <><View style={styles.art}><Ionicons name="sparkles" size={32} color="#FFC2B0" style={{position:'absolute',top:0,left:15}} /><View style={styles.check}><Ionicons name="checkmark" size={64} color={Colors.white} /></View><Ionicons name="sparkles" size={23} color={Colors.primary} style={{position:'absolute',right:0,bottom:10}} /></View><Text style={styles.title}>Withdraw Successful</Text><Pressable style={shared.button} accessibilityRole="button" onPress={() => router.replace('/restaurant/account')}><Text style={shared.buttonText}>OK</Text></Pressable></> : <><Text style={styles.caption}>Available Balance</Text><Text style={styles.amount}>${balance.toFixed(2)}</Text><Text style={styles.caption}>Withdraw your available balance.</Text><Pressable disabled={balance <= 0} style={[shared.button,{marginTop:32,opacity:balance > 0 ? 1 : 0.5}]} accessibilityRole="button" onPress={() => dialog.alert('Withdraw balance?', `Withdraw $${balance.toFixed(2)} from your available balance?`,[{text:'Cancel',style:'cancel'},{text:'Withdraw',onPress:()=>{if(withdraw())setSuccess(true);}}])}><Text style={shared.buttonText}>WITHDRAW</Text></Pressable></>}</View></SafeAreaView>;
}
const styles=StyleSheet.create({content:{flex:1,justifyContent:'center',padding:24,gap:20},art:{width:210,height:180,alignSelf:'center',alignItems:'center',justifyContent:'center',marginBottom:30},check:{width:96,height:96,borderRadius:48,backgroundColor:'#FF683B',alignItems:'center',justifyContent:'center'},title:{fontFamily:Fonts.bold,fontSize:24,color:Colors.text,textAlign:'center',marginBottom:8},caption:{fontFamily:Fonts.regular,color:Colors.textSecondary,textAlign:'center',fontSize:15},amount:{fontFamily:Fonts.bold,color:Colors.text,textAlign:'center',fontSize:38}});
