import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { paymentStyles as shared } from '@/components/payment-ui';
import { Colors, Fonts } from '@/constants/theme';
import { usePayment } from '@/providers/payment-provider';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentSuccessScreen() {
  const { order } = usePayment();
  return <SafeAreaView style={shared.screen}>
    <View style={styles.center}><Image source={require("../../assets/images/congratulations.png")} style={styles.art} resizeMode="contain" /><Text style={styles.title}>{order ? 'Congratulations!' : 'No checkout yet'}</Text><Text style={styles.message}>{order ? 'Your checkout is complete.' : 'Add food to your cart to try the payment flow.'}</Text>{order && <Text style={styles.receipt}>{order.method} · ${order.total.toFixed(2)}{ '\n' }{order.id}</Text>}</View>
    <View style={shared.bottom}><Pressable accessibilityRole="button" onPress={() => router.replace(order ? '/order-tracking' : '/home')} style={shared.button}><Text style={shared.buttonText}>{order ? 'TRACK ORDER' : 'BACK TO HOME'}</Text></Pressable></View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({ center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }, art: { width: 240, height: 230, marginBottom: 36 }, title: { fontFamily: Fonts.bold, fontSize: 26, color: Colors.text, textAlign: 'center' }, message: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 24, color: Colors.textSecondary, textAlign: 'center', marginTop: 18 }, receipt: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 24, color: Colors.text, marginTop: 22, textAlign: 'center' } });
