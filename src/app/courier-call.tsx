import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { sampleCourier } from "@/data/courier";
import TrackingMap from "@/components/tracking-map";
import { Colors, Fonts } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CourierCallScreen() {
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  return <SafeAreaView style={styles.screen}><View style={{ flex: 1 }}><TrackingMap /></View><View style={styles.panel}><Image source={sampleCourier.image} style={styles.avatar} /><Text style={styles.name}>{sampleCourier.name}</Text><Text style={styles.status}>Call unavailable</Text><Text style={styles.note}>Courier calling is not connected yet.</Text><View style={styles.controls}><Pressable accessibilityRole="button" accessibilityLabel="Mute microphone" accessibilityState={{ selected: muted }} onPress={() => setMuted(value => !value)} style={[styles.small, muted && styles.active]}><Ionicons name={muted ? 'mic-off-outline' : 'mic-outline'} size={24} color={Colors.text} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="End call" onPress={() => router.canGoBack() ? router.back() : router.replace('/order-tracking')} style={styles.end}><Ionicons name="call" size={30} color={Colors.white} style={{ transform: [{ rotate: '135deg' }] }} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Speaker" accessibilityState={{ selected: speaker }} onPress={() => setSpeaker(value => !value)} style={[styles.small, speaker && styles.active]}><Ionicons name={speaker ? 'volume-high-outline' : 'volume-low-outline'} size={24} color={Colors.text} /></Pressable></View></View></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: Colors.white }, panel: { backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 32, alignItems: 'center' }, avatar: { width: 108, height: 108, borderRadius: 54, backgroundColor: Colors.imagePlaceholder, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, name: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.text }, status: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.textSecondary, marginTop: 10 }, note: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.imagePlaceholder, marginTop: 8 }, controls: { flexDirection: 'row', alignItems: 'center', gap: 36, marginTop: 42, marginBottom: 16 }, small: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }, active: { backgroundColor: '#FFD9C0' }, end: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF3434', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 12px #FFF1EB' } });
