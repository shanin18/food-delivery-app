import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { trackingHtml } from '@/lib/tracking-map';
import { Colors } from '@/constants/theme';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function TrackingMap() {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  return <View style={{ flex: 1 }}><WebView key={attempt} source={{ html: trackingHtml, baseUrl: 'https://www.openstreetmap.org/' }} originWhitelist={['https://*', 'about:*']} onShouldStartLoadWithRequest={({ url }) => url === 'about:blank' || url === 'https://www.openstreetmap.org/'} geolocationEnabled={false} style={{ flex: 1 }} startInLoadingState renderLoading={() => <ActivityIndicator color={Colors.primary} style={{ position: 'absolute', top: '50%', left: '50%' }} />} onError={() => setFailed(true)} />{failed && <View style={{ position: 'absolute', inset: 0, backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center', gap: 16 }}><Text>Map unavailable. Check your connection.</Text><Pressable accessibilityRole="button" onPress={() => { setFailed(false); setAttempt(value => value + 1); }}><Text style={{ color: Colors.primary }}>Reload map</Text></Pressable></View>}</View>;
}
