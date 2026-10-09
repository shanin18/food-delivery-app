import { useFood } from "@/providers/food-provider";
import { OfferPopup } from "@/components/offer-popup";
import { Colors, Fonts } from "@/constants/theme";
import { restaurants } from "@/data/catalog";
import {
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = [
  {
    id: 1,
    name: "All",
    icon: "🔥",
  },
  {
    id: 2,
    name: "Hot Dog",
    image: require("../../assets/images/home/hot-dog.png"),
  },
  {
    id: 3,
    name: "Burger",
    image: require("../../assets/images/home/burger.png"),
  },
  { id: 4, name: "Pizza", icon: "🍕" },
  { id: 5, name: "Sandwich", icon: "🥪" },
  { id: 6, name: "Salad", icon: "🥗" },
  { id: 7, name: "Desserts", icon: "🍰" },
];

export default function HomeScreen() {
  const { items } = useFood();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom", "left", "right"]}
    >
      <OfferPopup />
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          stickyHeaderIndices={[2]}
        >
          {/* Header */}

          <View style={styles.header}>
            <Pressable
              style={styles.locationArea}
              onPress={() => router.push("/location-access")}
            >
              <View>
                <Text style={styles.deliverLabel}>DELIVER TO</Text>

                <View style={styles.locationRow}>
                  <Text style={styles.locationText}>Halal Lab office</Text>

                  <Ionicons name="chevron-down" size={14} color={Colors.text} />
                </View>
              </View>
            </Pressable>

            <Pressable style={styles.cartButton}>
              <Ionicons
                name="bag-handle-outline"
                size={21}
                color={Colors.white}
              />

              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            </Pressable>
          </View>

          {/* Greeting */}

          <Text style={styles.greeting}>
            Hey Halal, <Text style={styles.greetingBold}>Good Afternoon!</Text>
          </Text>

          {/* Search */}

          <View style={styles.stickySearch}>
            <Pressable accessibilityRole="button" accessibilityLabel="Search dishes and restaurants" onPress={() => router.push({ pathname: "/search", params: { focus: "true" } })} style={styles.searchContainer}>
              <Feather name="search" size={20} color={Colors.imagePlaceholder} />
              <Text style={[styles.searchInput, { color: Colors.textSecondary }]}>Search dishes, restaurants</Text>
            </Pressable>
          </View>

          {/* Categories */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Categories</Text>

            <Pressable style={styles.seeAll}>
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.textSecondary}
              />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            style={styles.categoryScroll}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {categories.map((category, index) => (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: "/food-category", params: { category: category.name } })}
                style={[
                  styles.categoryCard,
                  index === 0 && styles.activeCategory,
                ]}
              >
                <View style={styles.categoryImage}>
                  {category.image ? (
                    <Image
                      source={category.image}
                      style={styles.categoryPhoto}
                    />
                  ) : (
                    <Text style={styles.categoryEmoji}>{category.icon}</Text>
                  )}
                </View>

                <Text style={styles.categoryText}>{category.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Restaurants */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Open Restaurants</Text>

            <Pressable style={styles.seeAll}>
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.textSecondary}
              />
            </Pressable>
          </View>

          <View style={styles.restaurantList}>
            {restaurants.map((restaurant) => (
              <Pressable key={restaurant.id} accessibilityRole="button" accessibilityLabel={`View ${restaurant.name}`} onPress={() => router.push({ pathname: "/restaurant-details", params: { id: String(restaurant.id) } })} style={styles.restaurantCard}>
                <Image
                  source={restaurant.image}
                  style={styles.restaurantImage}
                />

                <Text style={styles.restaurantName}>{restaurant.name}</Text>

                <Text style={styles.restaurantCategories}>
                  {restaurant.categories}
                </Text>

                <View style={styles.restaurantInfo}>
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="star-outline"
                      size={19}
                      color={Colors.primary}
                    />
                    <Text style={styles.infoBold}>{restaurant.rating}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons
                      name="truck-delivery-outline"
                      size={20}
                      color={Colors.primary}
                    />
                    <Text style={styles.infoText}>{restaurant.delivery}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={Colors.primary}
                    />
                    <Text style={styles.infoText}>{restaurant.time}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}

        <View style={styles.bottomTabs}>
          <Pressable style={styles.tab}>
            <Ionicons name="home" size={24} color={Colors.primary} />
            <Text style={[styles.tabText, styles.activeTabText]}>Home</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search"
            onPress={() => router.push("/search")}
            style={styles.tab}
          >
            <Ionicons
              name="search-outline"
              size={24}
              color={Colors.textSecondary}
            />
            <Text style={styles.tabText}>Search</Text>
          </Pressable>

          <Pressable style={styles.tab}>
            <FontAwesome6 name="heart" size={22} color={Colors.textSecondary} />
            <Text style={styles.tabText}>Favorites</Text>
          </Pressable>

          <Pressable style={styles.tab}>
            <Ionicons
              name="person-outline"
              size={24}
              color={Colors.textSecondary}
            />
            <Text style={styles.tabText}>Profile</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 30,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  locationArea: {
    flexDirection: "row",
    alignItems: "center",
  },

  deliverLabel: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 3,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  locationText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  cartButton: {
    width: 49,
    height: 49,
    borderRadius: 23,
    backgroundColor: Colors.darkBackground,
    justifyContent: "center",
    alignItems: "center",
  },

  cartBadge: {
    position: "absolute",
    right: -2,
    top: -5,
    width: 25,
    height: 25,
    borderRadius: "50%",
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  cartBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: Colors.white,
  },

  // Greeting

  greeting: {
    marginTop: 24,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.text,
  },

  greetingBold: {
    fontFamily: Fonts.bold,
  },

  // Search
  stickySearch: {
    backgroundColor: Colors.background,
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },

  searchContainer: {
    height: 62,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: Colors.surface,

    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
  },


  // Section

  sectionHeader: {
    marginTop: 28,
    marginBottom: 15,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontFamily: Fonts.regular,
    fontSize: 20,
    color: Colors.text,
  },

  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 5,
  },

  seeAllText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
  },

  // Categories

  categoryScroll: {
    flexGrow: 0,
    marginHorizontal: -24,
  },

  categories: {
    gap: 12,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  categoryCard: {
    minWidth: 115,
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: "center",
    height: 60,
    paddingHorizontal: 10,
    borderRadius: 30,
    backgroundColor: Colors.background,

    flexDirection: "row",
    alignItems: "center",
    gap: 9,

    shadowColor: Colors.textSecondary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  activeCategory: {
    backgroundColor: "#FFD27C",
  },

  categoryImage: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  categoryPhoto: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },

  categoryEmoji: {
    fontSize: 27,
  },

  categoryText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.text,
  },

  // Restaurants

  restaurantList: {
    gap: 24,
  },

  restaurantCard: {
    width: "100%",
  },

  restaurantImage: {
    width: "100%",
    height: 155,
    borderRadius: 14,
    resizeMode: "cover",
    backgroundColor: Colors.surfaceSecondary,
  },

  restaurantName: {
    marginTop: 10,
    fontFamily: Fonts.regular,
    fontSize: 19,
    color: Colors.text,
  },

  restaurantCategories: {
    marginTop: 4,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.imagePlaceholder,
  },

  restaurantInfo: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  infoBold: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.text,
  },

  infoText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
  },

  // Bottom Tabs

  bottomTabs: {
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 14,

    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  tabText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  activeTabText: {
    color: Colors.primary,
  },
});
