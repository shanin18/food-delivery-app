import { PaymentHeader, paymentStyles as shared } from '@/components/payment-ui';
import { Colors, Fonts } from '@/constants/theme';
import { validateDemoCard } from '@/lib/payment';
import { usePayment } from '@/providers/payment-provider';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddCardScreen() {
  const { saveCard, confirm } = usePayment();
  const [holder, setHolder] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    try {
      const card = validateDemoCard(holder, number, expiry, cvc);
      confirm(card);
      saveCard(card);
      setNumber(''); setCvc('');
      router.replace('/payment-success');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Check your card details.'); }
  };
  return <SafeAreaView style={shared.screen}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <PaymentHeader title="Add Card" close />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={shared.content}>
      
      <Text style={styles.label}>CARD HOLDER NAME</Text><TextInput accessibilityLabel="Card holder name" value={holder} onChangeText={setHolder} placeholder="Name on card" maxLength={80} style={styles.input} autoComplete="off" />
      <Text style={styles.label}>CARD NUMBER</Text><TextInput accessibilityLabel="Card number" value={number} onChangeText={value => setNumber(value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())} placeholder="0000 0000 0000 0000" keyboardType="number-pad" style={styles.input} autoComplete="off" />
      <View style={styles.row}><View style={styles.column}><Text style={styles.label}>EXPIRE DATE</Text><TextInput accessibilityLabel="Expiry date" value={expiry} onChangeText={value => { const digits = value.replace(/\D/g, '').slice(0, 4); setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits); }} placeholder="MM/YY" keyboardType="number-pad" maxLength={5} style={styles.input} autoComplete="off" /></View><View style={styles.column}><Text style={styles.label}>CVC</Text><TextInput accessibilityLabel="CVC" value={cvc} onChangeText={value => setCvc(value.replace(/\D/g, '').slice(0, 3))} placeholder="•••" keyboardType="number-pad" secureTextEntry maxLength={3} style={styles.input} autoComplete="off" /></View></View>
      {error && <Text accessibilityRole="alert" style={shared.error}>{error}</Text>}
    </ScrollView>
    <View style={shared.bottom}><Pressable accessibilityRole="button" onPress={submit} style={shared.button}><Text style={shared.buttonText}>ADD & MAKE PAYMENT</Text></Pressable></View>
  </KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ label: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary, marginBottom: 12 }, input: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.text, backgroundColor: Colors.surfaceSecondary, padding: 20, borderRadius: 12, marginBottom: 28 }, row: { flexDirection: 'row', gap: 24 }, column: { flex: 1 } });
