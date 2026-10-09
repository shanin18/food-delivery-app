import { PaymentHeader, PaymentLogo, paymentStyles as shared } from '@/components/payment-ui';
import { Colors, Fonts } from '@/constants/theme';
import type { PaymentMethod } from '@/lib/payment';
import { useFood } from '@/providers/food-provider';
import { usePayment } from '@/providers/payment-provider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentScreen() {
  const { items } = useFood();
  const { cards, method, setMethod, selectedCard, selectCard, confirm } = usePayment();
  const [error, setError] = useState<string | null>(null);
  const available = cards.filter(card => card.brand === method);
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cardMethod = method === 'Visa' || method === 'Mastercard';
  const pay = () => { try { confirm(); router.replace('/payment-success'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Please try again.'); } };
  return <SafeAreaView style={shared.screen}>
    <PaymentHeader title="Payment" />
    <ScrollView contentContainerStyle={shared.content} showsVerticalScrollIndicator={false}>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.methods}>{(['Cash', 'Visa', 'Mastercard', 'PayPal'] as PaymentMethod[]).map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: method === value }} onPress={() => { setMethod(value); setError(null); }} style={styles.method}><View style={[styles.logo, method === value && styles.selected]}><PaymentLogo method={value} />{method === value && <View style={styles.check}><Ionicons name="checkmark" size={13} color={Colors.white} /></View>}</View><Text style={styles.methodText}>{value}</Text></Pressable>)}</ScrollView>
      {cardMethod && !available.length && <View style={styles.empty}><Ionicons name="card" size={100} color={Colors.primary} /><Text style={styles.emptyTitle}>No {method.toLowerCase()} card added</Text><Text style={styles.emptyText}>You can add a card and{ '\n' }save it for later.</Text></View>}
      {cardMethod && available.map(card => <Pressable key={card.id} accessibilityRole="button" accessibilityState={{ selected: selectedCard === card.id }} onPress={() => selectCard(card.id)} style={styles.saved}><View style={styles.savedHeading}><Text style={styles.emptyTitle}>{card.brand}</Text><Ionicons name={selectedCard === card.id ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={Colors.primary} /></View><View style={styles.savedNumber}><PaymentLogo method={card.brand} /><Text style={styles.emptyText}>•••• •••• •••• {card.last4}</Text></View></Pressable>)}
      {cardMethod && <Pressable accessibilityRole="button" onPress={() => router.push('/add-card')} style={styles.add}><Ionicons name="add" size={22} color={Colors.primary} /><Text style={styles.addText}>ADD NEW</Text></Pressable>}
      {!cardMethod && <View style={styles.empty}><PaymentLogo method={method} /><Text style={styles.emptyTitle}>{method === 'Cash' ? 'Cash on delivery' : 'PayPal'}</Text><Text style={styles.emptyText}>{method === 'Cash' ? 'Pay when your food arrives.' : 'Continue with PayPal.'}</Text></View>}
    </ScrollView>
    <View style={shared.bottom}>{error && <Text accessibilityRole="alert" style={shared.error}>{error}</Text>}<View style={styles.total}><Text style={styles.methodText}>TOTAL:</Text><Text style={styles.price}>${total.toFixed(2)}</Text></View><Pressable accessibilityRole="button" style={[shared.button, !items.length && { opacity: 0.5 }]} disabled={!items.length} onPress={pay}><Text style={shared.buttonText}>PAY & CONFIRM</Text></Pressable></View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  methods: { gap: 14, paddingBottom: 26, paddingTop: 6 }, method: { alignItems: 'center', gap: 8 },
  logo: { width: 88, height: 72, borderRadius: 10, backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.transparent },
  selected: { borderColor: Colors.primary }, check: { position: 'absolute', right: -5, top: -5, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  methodText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary },
  empty: { backgroundColor: Colors.surface, padding: 28, borderRadius: 12, alignItems: 'center', gap: 14 }, emptyTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.text }, emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  add: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18 }, addText: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.primary },
  saved: { backgroundColor: Colors.surface, borderRadius: 12, padding: 20, marginBottom: 12 }, savedHeading: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }, savedNumber: { flexDirection: 'row', alignItems: 'center', gap: 10 }, total: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 26 }, price: { fontFamily: Fonts.regular, fontSize: 28, color: Colors.darkBackground },
});
