import { RestaurantFilter } from "@/components/restaurant-filter";
import { emptyFoodFilters, matchesFoodFilters } from "@/lib/food-filters";
import { FoodCard } from '@/components/food-card';
import { Colors, Fonts } from '@/constants/theme';
import { dishes, restaurants } from '@/data/catalog';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RestaurantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const restaurant = restaurants.find(item => String(item.id) === id);
  const [category, setCategory] = useState('All');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState(emptyFoodFilters);
  const menu = dishes.filter(dish => dish.restaurantId === restaurant?.id);
  const categories = ['All', ...new Set(menu.map(dish => dish.category))];
  const filteredMenu = menu.filter(dish => restaurant && (category === 'All' || dish.category === category) && matchesFoodFilters(dish.price, restaurant, filters));
  const back = () => router.canGoBack() ? router.back() : router.replace('/home');
  return <SafeAreaView style={styles.screen}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={styles.back}><Ionicons name="chevron-back" size={22} color={Colors.text} /></Pressable><Text style={styles.headerTitle}>Restaurant View</Text><View style={{ flex: 1 }} /><Pressable accessibilityRole="button" accessibilityLabel="Filter restaurant menu" style={styles.back} onPress={() => setFilterVisible(true)}><Ionicons name="ellipsis-horizontal" size={24} color={Colors.text} /></Pressable></View>
    {restaurant ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.hero}><Image source={restaurant.image} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityLabel={restaurant.name} /></View>
      <Text style={styles.title}>{restaurant.name}</Text>
      <Text style={styles.description}>{restaurant.categories}</Text>
      <View style={styles.info}><Ionicons name="star-outline" size={22} color={Colors.primary} /><Text style={styles.rating}>{restaurant.rating}</Text><Ionicons name="bicycle-outline" size={22} color={Colors.primary} /><Text style={styles.infoText}>{restaurant.delivery}</Text><Ionicons name="time-outline" size={22} color={Colors.primary} /><Text style={styles.infoText}>{restaurant.time}</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>{categories.map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: value === category }} onPress={() => setCategory(value)} style={[styles.chip, value === category && styles.activeChip]}><Text style={[styles.chipText, value === category && { color: Colors.white }]}>{value}</Text></Pressable>)}</ScrollView>
      <Text style={styles.heading}>{category === 'All' ? 'Popular Food' : category}</Text>
      <View style={styles.grid}>{filteredMenu.map(dish => <FoodCard key={dish.id} dish={{ ...dish, restaurantName: restaurant.name }} showPrice />)}</View>
      {!!menu.length && !filteredMenu.length && <View><Text style={styles.description}>No food matches these filters.</Text><Pressable accessibilityRole="button" onPress={() => setFilters(emptyFoodFilters)}><Text style={[styles.description, { color: Colors.primary }]}>Clear filters</Text></Pressable></View>}
      {!menu.length && <Text style={styles.description}>This restaurant’s menu is not available yet.</Text>}
    </ScrollView> : <View style={styles.content}><Text style={styles.title}>Restaurant not found</Text><Text style={styles.description}>Go back and choose a restaurant.</Text></View>}
    {filterVisible && <RestaurantFilter initial={filters} onClose={() => setFilterVisible(false)} onApply={value => { setFilters(value); setFilterVisible(false); }} />}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingVertical: 20 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: Fonts.regular, fontSize: 18, color: Colors.text },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  hero: { alignSelf: 'stretch', aspectRatio: 2.2, borderRadius: 28, overflow: 'hidden' },
  title: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.darkBackground, marginTop: 24 },
  description: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary, lineHeight: 24, marginTop: 10 },
  info: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginVertical: 24 },
  rating: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.text, marginRight: 12 },
  infoText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.text, marginRight: 12 },
  categories: { gap: 12, paddingBottom: 28 },
  chip: { borderWidth: 1, borderColor: Colors.border, borderRadius: 26, paddingHorizontal: 22, paddingVertical: 14 },
  activeChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.text },
  heading: { fontFamily: Fonts.regular, fontSize: 20, color: Colors.text, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
