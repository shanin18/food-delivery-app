import { Colors, Fonts } from '@/constants/theme';
import { emptyFoodFilters, type FoodFilters } from '@/lib/food-filters';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function RestaurantFilter({ initial, onClose, onApply }: { initial: FoodFilters; onClose: () => void; onApply: (value: FoodFilters) => void }) {
  const [draft, setDraft] = useState(initial);
  const chip = (label: string, active: boolean, onPress: () => void) => <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.chip, active && styles.active]}><Text style={[styles.chipText, active && styles.activeText]}>{label}</Text></Pressable>;
  return <Modal transparent animationType="fade" onRequestClose={onClose}>
    <SafeAreaView style={styles.overlay}><View style={styles.dialog} accessibilityViewIsModal onAccessibilityEscape={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}><Text style={styles.title}>Filter your search</Text><Pressable accessibilityRole="button" accessibilityLabel="Close filters" onPress={onClose} style={styles.close}><Ionicons name="close" size={22} color={Colors.textSecondary} /></Pressable></View>
        <Text style={styles.label}>OFFERS</Text>
        <View style={styles.row}>{['Delivery', 'Pick Up', 'Offer', 'Online payment available'].map(offer => chip(offer, draft.offers.includes(offer), () => setDraft(value => ({ ...value, offers: value.offers.includes(offer) ? value.offers.filter(item => item !== offer) : [...value.offers, offer] }))))}</View>
        <Text style={styles.label}>DELIVER TIME</Text>
        <View style={styles.row}>{[15, 20, 30].map(minutes => chip(minutes === 15 ? '10–15 min' : `${minutes} min`, draft.minutes === minutes, () => setDraft(value => ({ ...value, minutes: value.minutes === minutes ? null : minutes }))))}</View>
        <Text style={styles.label}>PRICING</Text>
        <View style={styles.row}>{[1, 2, 3].map(price => <Pressable key={price} accessibilityRole="button" accessibilityLabel={price === 1 ? 'Under $40' : price === 2 ? '$40 to $70' : 'Over $70'} accessibilityState={{ selected: draft.price === price }} onPress={() => setDraft(value => ({ ...value, price: value.price === price ? null : price }))} style={[styles.round, draft.price === price && styles.active]}><Text style={[styles.chipText, draft.price === price && styles.activeText]}>{'$'.repeat(price)}</Text></Pressable>)}</View>
        <Text style={styles.label}>RATING</Text>
        <View style={styles.row}>{[1, 2, 3, 4, 5].map(rating => <Pressable key={rating} accessibilityRole="button" accessibilityLabel={`At least ${rating} stars`} accessibilityState={{ selected: draft.rating === rating }} onPress={() => setDraft(value => ({ ...value, rating: value.rating === rating ? 0 : rating }))} style={styles.round}><Ionicons name="star" size={20} color={rating <= draft.rating ? Colors.primary : '#D8D8D8'} /></Pressable>)}</View>
        <Pressable accessibilityRole="button" style={styles.apply} onPress={() => onApply(draft)}><Text style={styles.applyText}>FILTER</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => setDraft({ ...emptyFoodFilters, offers: [] })} style={styles.reset}><Text style={styles.resetText}>Reset filters</Text></Pressable>
      </ScrollView>
    </View></SafeAreaView>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(45,69,88,0.68)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  dialog: { width: '100%', maxWidth: 400, maxHeight: '95%', backgroundColor: Colors.white, borderRadius: 16 },
  content: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.text },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: Fonts.regular, fontSize: 11, letterSpacing: 1, color: Colors.text, marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 26 },
  chip: { borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 25, paddingHorizontal: 16, paddingVertical: 12 },
  chipText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary },
  active: { backgroundColor: '#FF9219', borderColor: '#FF9219' },
  activeText: { color: Colors.white },
  round: { width: 48, height: 48, borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  apply: { backgroundColor: Colors.primary, padding: 22, borderRadius: 10, alignItems: 'center' },
  applyText: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.white },
  reset: { alignItems: 'center', paddingTop: 16 },
  resetText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary },
});
