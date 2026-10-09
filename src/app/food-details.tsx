import { Colors, Fonts } from '@/constants/theme';
import { dishes, restaurants } from '@/data/catalog';
import { useFood } from '@/providers/food-provider';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FoodDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const dish = dishes.find(item => item.id === id);
  const { favorites, toggleFavorite, addItem } = useFood();
  const [size, setSize] = useState('14');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const back = () => router.canGoBack() ? router.back() : router.replace('/home');
  if (!dish) return <SafeAreaView style={styles.screen}><Text style={styles.title}>Food not found</Text><Pressable accessibilityRole="button" onPress={back}><Text style={styles.description}>Go back</Text></Pressable></SafeAreaView>;
  const restaurant = restaurants.find(item => item.id === dish.restaurantId)!;
  const pizza = dish.category === 'Pizza';
  const options = pizza ? ['10', '14', '16'] : ['S', 'M', 'L'];
  const selectedSize = pizza ? size : size === '14' ? 'M' : size;
  const unitPrice = dish.price + (selectedSize === '16' || selectedSize === 'L' ? 8 : selectedSize === '10' || selectedSize === 'S' ? -4 : 0);
  return <SafeAreaView style={styles.screen}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back" style={styles.back} onPress={back}><Ionicons name="chevron-back" size={22} color={Colors.text} /></Pressable><Text style={styles.headerTitle}>Details</Text></View>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.hero}>{dish.image && <Image source={dish.image} style={styles.heroImage} resizeMode="contain" />}<Pressable accessibilityRole="button" accessibilityLabel={favorites.includes(dish.id) ? 'Remove from favorites' : 'Add to favorites'} accessibilityState={{ selected: favorites.includes(dish.id) }} style={styles.favorite} onPress={() => toggleFavorite(dish.id)}><Ionicons name={favorites.includes(dish.id) ? 'heart' : 'heart-outline'} size={22} color={Colors.white} /></Pressable></View>
      <View style={styles.restaurant}><Ionicons name="restaurant-outline" size={18} color={Colors.primary} /><Text style={styles.restaurantText}>{dish.restaurantName}</Text></View>
      <Text style={styles.title}>{dish.id === 'european-pizza' ? 'Pizza Calzone European' : dish.name}</Text>
      <Text style={styles.description}>{dish.description}</Text>
      <View style={styles.info}><Ionicons name="star-outline" size={22} color={Colors.primary} /><Text style={styles.rating}>{restaurant.rating}</Text><Ionicons name="bicycle-outline" size={22} color={Colors.primary} /><Text style={styles.infoText}>{restaurant.delivery}</Text><Ionicons name="time-outline" size={22} color={Colors.primary} /><Text style={styles.infoText}>{restaurant.time}</Text></View>
      <View style={styles.sizes}><Text style={styles.label}>SIZE:</Text>{options.map(option => <Pressable key={option} accessibilityRole="button" accessibilityLabel={`Size ${option}${pizza ? ' inches' : ''}`} accessibilityState={{ selected: selectedSize === option }} onPress={() => { setSize(option); setAdded(false); }} style={[styles.size, selectedSize === option && styles.selectedSize]}><Text style={[styles.sizeText, selectedSize === option && { color: Colors.white }]}>{option}{pizza ? '″' : ''}</Text></Pressable>)}</View>
      <Text style={styles.label}>INGREDIENTS</Text>
      <View style={styles.ingredients}>{dish.ingredients.map((ingredient, index) => <View key={ingredient} style={styles.ingredientItem}><View style={styles.ingredient}><Ionicons name={(['nutrition-outline', 'restaurant-outline', 'leaf-outline', 'flame-outline', 'flower-outline'] as const)[index % 5]} size={23} color={Colors.primary} /></View><Text style={styles.ingredientLabel}>{ingredient}</Text></View>)}</View>
    </ScrollView>
    <View style={styles.purchase}>
      <View style={styles.purchaseRow}><Text style={styles.price}>${unitPrice * quantity}</Text><View style={styles.quantity}><Pressable accessibilityRole="button" accessibilityLabel="Decrease quantity" disabled={quantity === 1} onPress={() => { setQuantity(value => value - 1); setAdded(false); }} style={[styles.quantityButton, quantity === 1 && { opacity: 0.4 }]}><Ionicons name="remove" size={18} color={Colors.white} /></Pressable><Text style={styles.quantityText}>{quantity}</Text><Pressable accessibilityRole="button" accessibilityLabel="Increase quantity" disabled={quantity === 99} onPress={() => { setQuantity(value => value + 1); setAdded(false); }} style={styles.quantityButton}><Ionicons name="add" size={18} color={Colors.white} /></Pressable></View></View>
      <Pressable accessibilityRole="button" style={styles.addButton} onPress={() => { if (added) { router.push("/cart"); return; } addItem({ dishId: dish.id, size: selectedSize, quantity, unitPrice }); setAdded(true); }}><Text accessibilityLiveRegion="polite" style={styles.addText}>{added ? 'VIEW CART' : 'ADD TO CART'}</Text></Pressable>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingVertical: 20 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: Fonts.regular, fontSize: 18, color: Colors.text },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  hero: { alignSelf: 'stretch', aspectRatio: 1.78, borderRadius: 28, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  favorite: { position: 'absolute', bottom: 18, right: 18, width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  restaurant: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, marginTop: 24 },
  restaurantText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.text },
  title: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.darkBackground, marginTop: 20 },
  description: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary, lineHeight: 25, marginTop: 10 },
  info: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginVertical: 24 },
  rating: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.text, marginRight: 12 },
  infoText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.text, marginRight: 12 },
  sizes: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  label: { fontFamily: Fonts.regular, fontSize: 12, letterSpacing: 1, color: Colors.text },
  size: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
  selectedSize: { backgroundColor: '#FF9219' },
  sizeText: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.text },
  ingredients: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginTop: 18 },
  ingredientItem: { alignItems: 'center', flex: 1 },
  ingredient: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFECE5', justifyContent: 'center', alignItems: 'center' },
  ingredientLabel: { fontFamily: Fonts.regular, fontSize: 10, color: Colors.textSecondary, marginTop: 6 },
  purchase: { backgroundColor: Colors.surfaceSecondary, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  purchaseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  price: { fontFamily: Fonts.regular, fontSize: 28, color: Colors.darkBackground },
  quantity: { flexDirection: 'row', alignItems: 'center', gap: 20, borderRadius: 30, padding: 12, backgroundColor: Colors.darkBackground },
  quantityButton: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#414150', justifyContent: 'center', alignItems: 'center' },
  quantityText: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.white },
  addButton: { backgroundColor: Colors.primary, borderRadius: 12, padding: 22, alignItems: 'center' },
  addText: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.white },
});
