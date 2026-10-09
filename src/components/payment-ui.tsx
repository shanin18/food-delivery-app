import { Colors, Fonts } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PaymentMethod } from '@/lib/payment';

export function PaymentHeader({ title, close = false }: { title: string; close?: boolean }) {
  return <View style={paymentStyles.header}><Pressable accessibilityRole="button" accessibilityLabel={close ? 'Close' : 'Back'} style={paymentStyles.back} onPress={() => router.canGoBack() ? router.back() : router.replace('/cart')}><Ionicons name={close ? 'close' : 'chevron-back'} size={22} color={Colors.text} /></Pressable><Text style={paymentStyles.headerTitle}>{title}</Text></View>;
}
export function PaymentLogo({ method }: { method: PaymentMethod }) {
  if (method === 'Mastercard') return <View style={{ flexDirection: 'row' }}><View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#EB001B' }} /><View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#F79E1B', marginLeft: -8 }} /></View>;
  if (method === 'Cash') return <Ionicons name="cash-outline" size={30} color={Colors.primary} />;
  return <Text style={{ fontFamily: Fonts.extraBold, fontSize: 20, fontStyle: 'italic', color: '#216AC0' }}>{method === 'Visa' ? 'VISA' : 'PayPal'}</Text>;
}
export const paymentStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 24 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Fonts.regular, fontSize: 18, color: Colors.text },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  demo: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 20, color: Colors.textSecondary, marginBottom: 20 },
  bottom: { padding: 24 },
  button: { backgroundColor: Colors.primary, borderRadius: 12, padding: 22, alignItems: 'center' },
  buttonText: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.white },
  error: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 22, color: Colors.error, marginBottom: 12 },
});
