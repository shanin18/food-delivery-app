import { FoodCard } from "@/components/food-card";
import { Colors, Fonts } from "@/constants/theme";
import { dishes, restaurants } from "@/data/catalog";
import { clearRecentSearches, getRecentSearches, matchesSearch as matches, rememberSearch } from "@/lib/search";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Image, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const suggestedKeywords = ["Burger", "Sandwich", "Hot Dog", "Pizza", "Salad", "Desserts"];

export default function SearchScreen() {
  const { q, focus } = useLocalSearchParams<{ q?: string; focus?: string }>();
  const [query, setQuery] = useState(q ?? "");
  const [recent, setRecent] = useState(getRecentSearches);
  const input = useRef<TextInput>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const suggestions = [...new Set([...recent, ...suggestedKeywords, ...dishes.map(dish => dish.name), ...restaurants.map(restaurant => restaurant.name)])].filter(value => matches(query, value)).slice(0, 5);
  const chooseSuggestion = (value: string) => {
    setQuery(value);
    setRecent(rememberSearch(value));
    setSearchFocused(false);
    Keyboard.dismiss();
  };
  const restaurantResults = restaurants.filter(restaurant => matches(query, `${restaurant.name} ${restaurant.categories} ${dishes.filter(dish => dish.restaurantId === restaurant.id).map(dish => `${dish.name} ${dish.keywords}`).join(" ")}`));
  const foodResults = dishes.filter(dish => matches(query, `${dish.name} ${dish.keywords} ${restaurants.find(restaurant => restaurant.id === dish.restaurantId)?.name ?? ""}`));
  const keywords = [...recent, ...suggestedKeywords.filter(keyword => !recent.some(value => value.toLowerCase() === keyword.toLowerCase()))];

  const remember = (value = query) => {
    const term = value.trim().slice(0, 60);
    if (!term) return;
    setRecent(rememberSearch(term));
  };
  const openRestaurant = (restaurant: (typeof restaurants)[number]) => {
    remember();
    Keyboard.dismiss();
    router.push({ pathname: "/restaurant-details", params: { id: String(restaurant.id) } });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Home" onPress={() => router.canGoBack() ? router.back() : router.replace("/home")} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={Colors.darkBackground} />
        </Pressable>
        <Text style={styles.headerTitle}>Search</Text>
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={21} color={Colors.imagePlaceholder} />
        <TextInput autoFocus={focus === "true"} ref={input} value={query} onChangeText={setQuery} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} placeholder="Search dishes, restaurants" placeholderTextColor={Colors.textSecondary} style={styles.input} accessibilityLabel="Search dishes and restaurants" autoCapitalize="none" autoCorrect={false} maxLength={60} returnKeyType="search" onSubmitEditing={() => { remember(); Keyboard.dismiss(); }} />
        {!!query && <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10} onPress={() => { setQuery(""); input.current?.focus(); }}><Ionicons name="close-circle" size={22} color={Colors.imagePlaceholder} /></Pressable>}
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {searchFocused && !!query.trim() && <View style={styles.suggestions}>
          {suggestions.map(value => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`Search for ${value}`} onPress={() => chooseSuggestion(value)} style={styles.suggestion}><Ionicons name="search-outline" size={18} color={Colors.imagePlaceholder} /><Text style={styles.suggestionText}>{value}</Text><Ionicons name="arrow-up-outline" size={16} color={Colors.imagePlaceholder} /></Pressable>)}
          <Pressable accessibilityRole="button" onPress={() => chooseSuggestion(query.trim())} style={styles.suggestion}><Text style={[styles.suggestionText, { color: Colors.primary }]}>See all results for ?{query.trim()}?</Text><Ionicons name="chevron-forward" size={16} color={Colors.primary} /></Pressable>
        </View>}
        <View style={styles.sectionHeading}>
          <Text style={styles.heading}>{recent.length ? "Recent Keywords" : "Popular Keywords"}</Text>
          {!!recent.length && <Pressable accessibilityRole="button" onPress={() => setRecent(clearRecentSearches())} hitSlop={8}><Text style={styles.clear}>Clear history</Text></Pressable>}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.keywords}>
          {keywords.map(keyword => <Pressable key={keyword} accessibilityRole="button" onPress={() => { setQuery(keyword); remember(keyword); Keyboard.dismiss(); }} style={[styles.chip, query.toLowerCase() === keyword.toLowerCase() && styles.activeChip]}><Text style={styles.chipText}>{keyword}</Text></Pressable>)}
        </ScrollView>
        <Text style={styles.heading}>{query.trim() ? "Restaurants" : "Suggested Restaurants"}</Text>
        {restaurantResults.map(restaurant => (
          <Pressable key={restaurant.id} accessibilityRole="button" accessibilityLabel={`View ${restaurant.name}`} onPress={() => openRestaurant(restaurant)} style={styles.restaurant}>
            <Image source={restaurant.image} style={styles.restaurantImage} />
            <View style={styles.restaurantText}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <View style={styles.rating}><Ionicons name="star-outline" size={18} color={Colors.primary} /><Text style={styles.ratingText}>{restaurant.rating}</Text></View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.imagePlaceholder} />
          </Pressable>
        ))}
        {!restaurantResults.length && <Text style={styles.empty}>No restaurants match your search.</Text>}
        <Text style={[styles.heading, styles.foodHeading]}>{query.trim() ? "Matching Food" : "Popular Fast Food"}</Text>
        <View style={styles.foodGrid}>
          {foodResults.map(dish => <FoodCard key={dish.id} dish={dish} />)}
        </View>
        {!foodResults.length && <Text style={styles.empty}>No dishes match your search. Try Burger, Hot Dog, or Salad.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  back: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: Fonts.regular, fontSize: 18, color: Colors.darkBackground },
  searchBox: { marginHorizontal: 24, paddingHorizontal: 18, minHeight: 64, borderRadius: 12, backgroundColor: Colors.surface, flexDirection: "row", alignItems: "center", gap: 10 },
  input: { flex: 1, paddingVertical: 18, fontFamily: Fonts.regular, fontSize: 14, color: Colors.text },
  content: { paddingHorizontal: 24, paddingTop: 26, paddingBottom: 32 },
  suggestions: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, marginBottom: 24, overflow: "hidden" },
  suggestion: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  suggestionText: { flex: 1, fontFamily: Fonts.regular, fontSize: 14, color: Colors.text },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  heading: { fontFamily: Fonts.regular, fontSize: 20, color: Colors.darkBackground, marginBottom: 16 },
  clear: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.primary, marginBottom: 16 },
  keywords: { gap: 10, paddingBottom: 30 },
  chip: { borderWidth: 1, borderColor: Colors.border, borderRadius: 25, paddingHorizontal: 20, paddingVertical: 14 },
  activeChip: { borderColor: Colors.primary, backgroundColor: "#FFF1E8" },
  chipText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.darkBackground },
  restaurant: { flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 14 },
  restaurantImage: { width: 60, height: 60, borderRadius: 10 },
  restaurantText: { flex: 1, gap: 6 },
  restaurantName: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.text },
  rating: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.darkBackground },
  foodHeading: { marginTop: 30 },
  foodGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  foodCard: { flexBasis: "45%", flexGrow: 1, maxWidth: "50%", padding: 12, borderRadius: 18, backgroundColor: Colors.surface },
  foodImage: { width: "100%", height: 100, borderRadius: 14, marginBottom: 10 },
  foodName: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.text },
  foodRestaurant: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary, marginTop: 5 },
  empty: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary, lineHeight: 22, paddingVertical: 12 },
});
