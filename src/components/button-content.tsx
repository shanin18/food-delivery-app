import { Colors } from '@/constants/theme';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function ButtonContent({ busy, children, color = Colors.white }: {
  busy: boolean;
  children: ReactNode;
  color?: string;
}) {
  return (
    <View style={styles.container} accessibilityState={{ busy }}>
      <View style={[styles.content, busy && styles.hidden]} accessibilityElementsHidden={busy} importantForAccessibility={busy ? 'no-hide-descendants' : 'auto'}>
        {children}
      </View>
      {busy && <ActivityIndicator style={styles.spinner} color={color} accessibilityLabel="Please wait" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  hidden: { opacity: 0 },
  spinner: { position: 'absolute' },
});
