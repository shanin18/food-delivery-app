import { PaymentHeader, paymentStyles as shared } from '@/components/payment-ui';
import { Colors, Fonts } from '@/constants/theme';
import { usePayment } from '@/providers/payment-provider';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderTrackingScreen() {
  const { order } = usePayment();
  return <SafeAreaView style={shared.screen}><PaymentHeader title="Order Details" /><ScrollView contentContainerStyle={shared.content}>{order && <View style={{ padding: 24, borderRadius: 20, backgroundColor: Colors.surfaceSecondary, gap: 18 }}><Text style={{ fontFamily: Fonts.bold, fontSize: 20, color: Colors.text }}>Checkout confirmed</Text>{[order.id, `${order.quantity} items · $${order.total.toFixed(2)}`, `Payment method: ${order.method}`, `Delivery address: ${order.address}`].map(value => <Text key={value} style={{ fontFamily: Fonts.regular, fontSize: 14, lineHeight: 24, color: Colors.text }}>{value}</Text>)}</View>}</ScrollView><View style={shared.bottom}><Pressable accessibilityRole="button" onPress={() => router.replace('/home')} style={shared.button}><Text style={shared.buttonText}>BACK TO HOME</Text></Pressable></View></SafeAreaView>;
}
