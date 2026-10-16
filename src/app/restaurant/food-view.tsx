import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { useAppDialog } from '@/providers/dialog-provider';
import { FoodPhotoGallery } from '@/components/food-photo-gallery';
import { IngredientIcon } from '@/components/ingredient-icon';
import { ProfileHeader, profileStyles as shared } from '@/components/profile-ui';
import { RestaurantNavigation } from '@/components/restaurant-navigation';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '@/constants/theme';
import { useRestaurant } from '@/providers/restaurant-provider';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function RestaurantFoodViewScreen() {
 const dialog = useAppDialog();
  const { id } = useLocalSearchParams<{ id?: string }>(); const { menu, account, deleteFood } = useRestaurant(); const food = menu.find(value => value.id === id);
  return <SafeAreaView style={shared.screen}><ProfileHeader title="Food Details" action={food && <Pressable accessibilityRole="button" hitSlop={12} onPress={() => router.push({ pathname: "/restaurant/food-edit", params: { id: food.id } })}><Text style={shared.edit}>EDIT</Text></Pressable>} /><ScrollView contentContainerStyle={shared.content}>{food ? <><View><FoodPhotoGallery key={food.id + JSON.stringify(food.photos)} photos={food.photos} fallback={food.image} name={food.name} /><Text style={{ position: 'absolute', left: 14, bottom: 12, padding: 8, backgroundColor: '#FFFFFFDD', borderRadius: 12, color: Colors.text, fontSize: 12 }}>{food.category} · {food.delivery ? 'Delivery' : 'Pick Up'}</Text></View><View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}><Text style={shared.name}>{food.name}</Text><Text style={shared.name}>${food.price}</Text></View><Text style={shared.bio}>{account.location || account.restaurant_name} · <Text style={{ color: Colors.primary }}>★ {food.rating.toFixed(1)}</Text> ({food.reviews} Reviews)</Text><Text style={{ fontFamily: Fonts.medium, fontSize: 12, color: Colors.text, marginTop: 30, marginBottom: 20 }}>INGREDIENTS</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>{food.ingredients.map(value => <View key={value} style={{ alignItems: 'center', width: 52 }}><View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF0E8', alignItems: 'center', justifyContent: 'center' }}><IngredientIcon ingredient={value} size={22} color={Colors.primary} /></View><Text style={[shared.bio, { fontSize: 10 }]}>{value}</Text></View>)}</View><Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.text, marginTop: 28 }}>Description</Text><Text style={shared.bio}>{food.description}</Text></> : <Text style={shared.error}>Food item not found.</Text>}</ScrollView>{food && <View style={styles.actions}><Pressable accessibilityRole="button" onPress={() => dialog.alert("Delete food item?", food.name, [{ text: "Keep", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => { deleteFood(food.id); router.replace("/restaurant/food-list"); } }])} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}><Ionicons name="trash-outline" size={19} color={Colors.error} /><Text style={styles.deleteText}>Delete</Text></Pressable></View>}<RestaurantNavigation /></SafeAreaView>;
}

const styles = StyleSheet.create({
 actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
 deleteButton: { flex: 1, minHeight: 52, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#FFDAD6', backgroundColor: '#FFF6F5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
 deleteText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.error },
 pressed: { opacity: 0.7 },
});
