import { Colors, Fonts } from '@/constants/theme';
import type { Dish } from '@/data/catalog';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export function FoodCard({ dish, showPrice = false }: { dish: Dish; showPrice?: boolean }) {
  const open = () => router.push({ pathname: '/food-details', params: { id: dish.id } });
  return <View style={styles.slot}>
    <Pressable accessibilityRole="button" accessibilityLabel={`View ${dish.name}`} onPress={open} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <View style={styles.photo}>{dish.image && <Image source={dish.image} style={styles.image} resizeMode="contain" />}</View>
      <Text style={styles.name}>{dish.name}</Text>
      <Text style={styles.restaurant}>{dish.restaurantName}</Text>
      {showPrice && <View style={styles.footer}><Text style={styles.price}>${dish.price}</Text><View style={styles.add}><Ionicons name="add" size={21} color={Colors.white} /></View></View>}
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  slot: { width: '47%', paddingTop: 32, marginBottom: 20 },
  card: { backgroundColor: Colors.white, borderRadius: 24, paddingHorizontal: 14, paddingBottom: 16, boxShadow: '0px 14px 36px rgba(32, 36, 50, 0.08)' },
  photo: { marginTop: -32, width: '100%', aspectRatio: 1.45, marginBottom: 12 },
  image: { width: '100%', height: '100%' },
  name: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.text, lineHeight: 20 },
  restaurant: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  price: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.text },
  add: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF9219', alignItems: 'center', justifyContent: 'center' },
});
