import { FoodCard } from '@/components/food-card';
import { Colors, Fonts } from '@/constants/theme';
import { dishes, foodCategories, restaurants } from '@/data/catalog';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FoodCategoryScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [current, setCurrent] = useState(category && foodCategories.includes(category) ? category : 'Burger');
  const [picker, setPicker] = useState(false);
  const [sortByPrice, setSortByPrice] = useState(false);
  const foods = dishes.filter(dish => current === 'All' || dish.category === current || (current === 'Sandwich' && dish.keywords.includes('sandwich'))).sort((a, b) => sortByPrice ? a.price - b.price : 0);
  const openRestaurants = restaurants.filter(restaurant => current === 'All' || foods.some(dish => dish.restaurantId === restaurant.id) || restaurant.categories.toLowerCase().includes(current.toLowerCase()));
  return <SafeAreaView style={styles.screen}>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" style={styles.circle} onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}><Ionicons name="chevron-back" size={22} color={Colors.text} /></Pressable>
      <Pressable accessibilityRole="button" style={styles.category} onPress={() => setPicker(true)}><Text style={styles.categoryText}>{current.toUpperCase()}</Text><Ionicons name="caret-down" size={12} color={Colors.primary} /></Pressable>
      <View style={{ flex: 1 }} />
      <Pressable accessibilityRole="button" accessibilityLabel="Search food" style={[styles.circle, styles.dark]} onPress={() => router.push({ pathname: '/search', params: { focus: 'true' } })}><Ionicons name="search-outline" size={22} color={Colors.white} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Sort by price" accessibilityState={{ selected: sortByPrice }} style={styles.circle} onPress={() => setSortByPrice(value => !value)}><Ionicons name="options-outline" size={22} color={sortByPrice ? Colors.primary : Colors.text} /></Pressable>
    </View>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Popular {current === 'All' ? 'Food' : current === 'Burger' ? 'Burgers' : current}</Text>
      <View style={styles.grid}>{foods.map(dish => <FoodCard key={dish.id} dish={dish} showPrice />)}</View>
      {!foods.length && <Text style={styles.empty}>No dishes available in this category yet.</Text>}
      <Text style={[styles.heading, { marginTop: 12 }]}>Open Restaurants</Text>
      {openRestaurants.map(restaurant => <Pressable key={restaurant.id} accessibilityRole="button" onPress={() => router.push({ pathname: "/restaurant-details", params: { id: String(restaurant.id) } })} style={styles.restaurant}>
        <Image source={restaurant.image} style={styles.restaurantImage} />
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        <View style={styles.info}><Ionicons name="star-outline" size={20} color={Colors.primary} /><Text style={styles.infoText}>{restaurant.rating}</Text><Ionicons name="bicycle-outline" size={20} color={Colors.primary} /><Text style={styles.infoText}>{restaurant.delivery}</Text><Ionicons name="time-outline" size={20} color={Colors.primary} /><Text style={styles.infoText}>{restaurant.time}</Text></View>
      </Pressable>)}
      {!openRestaurants.length && <Text style={styles.empty}>No restaurants available in this category yet.</Text>}
    </ScrollView>
    <Modal transparent visible={picker} animationType="fade" onRequestClose={() => setPicker(false)}><SafeAreaView style={styles.overlay}><View style={styles.picker}><Text style={styles.heading}>Choose a category</Text>{foodCategories.map(value => <Pressable key={value} accessibilityRole="button" onPress={() => { setCurrent(value); setPicker(false); }} style={styles.option}><Text style={styles.restaurantName}>{value}</Text>{value === current && <Ionicons name="checkmark" size={20} color={Colors.primary} />}</Pressable>)}<Pressable accessibilityRole="button" onPress={() => setPicker(false)} style={styles.option}><Text style={styles.empty}>Cancel</Text></Pressable></View></SafeAreaView></Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24, paddingVertical: 20 },
  circle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  dark: { backgroundColor: Colors.darkBackground },
  category: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: 24, padding: 14 },
  categoryText: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.text },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  heading: { fontFamily: Fonts.regular, fontSize: 20, color: Colors.darkBackground, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  restaurant: { marginBottom: 24 },
  restaurantImage: { width: '100%', aspectRatio: 2.3, borderRadius: 12 },
  restaurantName: { fontFamily: Fonts.regular, fontSize: 18, color: Colors.text, marginTop: 10 },
  info: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  infoText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.text, marginRight: 10 },
  empty: { fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 22, marginBottom: 20 },
  overlay: { flex: 1, backgroundColor: 'rgba(18,18,35,0.45)', justifyContent: 'center', padding: 24 },
  picker: { backgroundColor: Colors.white, borderRadius: 24, padding: 24 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
});
