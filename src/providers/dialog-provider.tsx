import { Colors, Fonts } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Action = { text: string; style?: 'cancel' | 'destructive' | 'default'; onPress?: () => unknown };
type Dialog = { title: string; message?: string; buttons: Action[] };
const Context = createContext<{ alert: (title: string, message?: string, buttons?: Action[]) => void } | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [visible, setVisible] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const busy = activeButton !== null;
  const currentDialog = useRef<Dialog | null>(null);
  const running = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const alert = (title: string, message?: string, buttons: Action[] = [{ text: 'OK' }]) => {
    const next = { title, message, buttons };
    currentDialog.current = next; running.current = false;
    setError(null); setActiveButton(null); setDialog(next); setVisible(true);
  };
  const cancel = dialog?.buttons.find(button => button.style === 'cancel');
  const destructive = dialog?.buttons.some(button => button.style === 'destructive');
  // Retain the content and selected spinner throughout the native fade-out.
  const close = () => { if (!running.current) { setVisible(false); cancel?.onPress?.(); } };
  const perform = async (button: Action, index: number) => {
    if (running.current) return;
    if (button.style === 'cancel' || !button.onPress) { setVisible(false); button.onPress?.(); return; }
    const pendingDialog = dialog;
    running.current = true; setActiveButton(index); setError(null);
    try {
      await button.onPress();
      if (currentDialog.current === pendingDialog) setVisible(false);
    } catch {
      if (currentDialog.current === pendingDialog) {
        running.current = false; setActiveButton(null);
        setError('Could not complete this action. Please try again.');
      }
    }
  };
  return <Context.Provider value={{ alert }}>{children}<Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
    <SafeAreaView style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Dismiss dialog" accessibilityRole="button" onPress={close} />
      <View style={styles.card} accessibilityViewIsModal>
        <ScrollView bounces={false} contentContainerStyle={styles.content}>
          <View style={[styles.symbol, destructive && styles.dangerSymbol]}><Ionicons name={destructive ? 'trash-outline' : 'checkmark-circle-outline'} size={30} color={destructive ? Colors.error : Colors.primary} /></View>
          <Text accessibilityRole="header" style={styles.title}>{dialog?.title}</Text>
          {!!dialog?.message && <Text style={styles.message}>{dialog.message}</Text>}
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <View style={styles.actions}>{dialog?.buttons.map((button,index) => <Pressable key={index} accessibilityRole="button" disabled={busy} onPress={() => void perform(button, index)} style={({ pressed }) => [styles.button, button.style === 'cancel' ? styles.cancel : { backgroundColor: button.style === 'destructive' ? Colors.error : Colors.primary }, pressed && { opacity: 0.75 }]}>{activeButton === index ? <ActivityIndicator color={Colors.white} /> : <Text style={[styles.buttonText, button.style === 'cancel' && { color: Colors.textSecondary }]}>{button.text}</Text>}</Pressable>)}</View>
        </ScrollView>
      </View>
    </SafeAreaView>
  </Modal></Context.Provider>;
}
export function useAppDialog() { const dialog = useContext(Context); if (!dialog) throw new Error('DialogProvider required'); return dialog; }
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(18,18,35,0.52)', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400, maxHeight: '90%', alignSelf: 'center', backgroundColor: Colors.white, borderRadius: 26, overflow: 'hidden' },
  content: { padding: 26, alignItems: 'center' },
  symbol: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#FFF0E6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  dangerSymbol: { backgroundColor: '#FFF0EF' },
  title: { fontFamily: Fonts.bold, color: Colors.text, fontSize: 22, textAlign: 'center' },
  message: { fontFamily: Fonts.regular, color: Colors.textSecondary, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 12 },
  error: { fontFamily: Fonts.regular, color: Colors.error, marginTop: 12, textAlign: 'center' },
  actions: { width: '100%', gap: 10, marginTop: 26 },
  button: { minHeight: 52, borderRadius: 13, paddingVertical: 15, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  cancel: { backgroundColor: '#F3F5F8' },
  buttonText: { fontFamily: Fonts.bold, color: Colors.white, fontSize: 14, textAlign: 'center' },
});
