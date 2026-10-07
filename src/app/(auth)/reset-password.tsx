import { AuthFeedback } from '@/components/auth-feedback';
import { Colors, Fonts } from '@/constants/theme';
import { useAuthAction } from '@/hooks/use-auth-action';
import { validatePassword } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const { busy, error, run } = useAuthAction();
  const updatePassword = () => run(async () => {
    validatePassword(password, confirmation);
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) throw error;
    setPassword(''); setConfirmation('');
    router.replace('/home');
  });
  return <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.description}>Choose a new password with at least 6 characters.</Text>
        <AuthFeedback busy={busy} error={error} />
        <Text style={styles.label}>NEW PASSWORD</Text>
        <TextInput accessibilityLabel="New password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword" editable={!busy} />
        <Text style={styles.label}>CONFIRM PASSWORD</Text>
        <TextInput accessibilityLabel="Confirm new password" style={styles.input} value={confirmation} onChangeText={setConfirmation} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword" editable={!busy} />
        <Pressable accessibilityRole="button" style={styles.button} disabled={busy} onPress={updatePassword}><Text style={styles.buttonText}>SAVE PASSWORD</Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  title: { fontFamily: Fonts.bold, fontSize: 30, color: Colors.text, marginBottom: 12 },
  description: { color: Colors.textSecondary, lineHeight: 22, marginBottom: 24 },
  label: { color: Colors.text, marginBottom: 8 },
  input: { backgroundColor: Colors.surfaceSecondary, color: Colors.text, padding: 20, borderRadius: 10, marginBottom: 24 },
  button: { backgroundColor: Colors.primary, borderRadius: 12, padding: 24, alignItems: 'center' },
  buttonText: { color: Colors.white, fontFamily: Fonts.bold },
});
