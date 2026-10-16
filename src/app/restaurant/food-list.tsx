import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { ProfileHeader, profileStyles as shared } from '@/components/profile-ui';
import { RestaurantNavigation } from '@/components/restaurant-navigation';
import { Colors, Fonts } from '@/constants/theme';
import { useRestaurant } from '@/providers/restaurant-provider';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function RestaurantFoodListScreen() {
  const { menu } = useRestaurant();
  const [category, setCategory] = useState('All');
  const visible = menu.filter(food => category === 'All' || food.category === category);
  return <SafeAreaView style={shared.screen}><ProfileHeader title="My Food List" /><View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, marginHorizontal: 24 }}>{['All','Breakfast','Lunch','Dinner'].map(value => <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: category === value }} onPress={() => setCategory(value)} style={{ flex: 1, alignItems: 'center', paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: category === value ? Colors.primary : Colors.transparent }}><Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: category === value ? Colors.primary : Colors.text }}>{value}</Text></Pressable>)}</View><ScrollView contentContainerStyle={shared.content}><Text style={[shared.bio, { marginVertical: 20 }]}>Total {String(visible.length).padStart(2,'0')} items</Text>{visible.map(food => <Pressable feedback="row" key={food.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/restaurant/food-view', params: { id: food.id } })} style={{ flexDirection: 'row', gap: 14, marginBottom: 24 }}><Image source={food.image} style={{ width: 94, height: 94, borderRadius: 16 }} resizeMode="contain" /><View style={{ flex: 1 }}><View style={{ flexDirection: 'row', gap: 8 }}><Text style={{ flex: 1, fontFamily: Fonts.bold, fontSize: 14, color: Colors.text }}>{food.name}</Text></View><View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}><Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: Colors.primary, backgroundColor: '#FFF0E5', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>{food.category}</Text><Text style={{ fontFamily: Fonts.bold, color: Colors.text }}>${food.price}</Text></View><Text style={shared.bio}><Text style={{ color: Colors.primary }}>★ {food.rating.toFixed(1)}</Text>  ({food.reviews} Reviews)  {food.pickup ? 'Pick Up' : 'Delivery'}</Text></View></Pressable>)}{!visible.length && <Text style={shared.bio}>No items in this category. Use + to add one.</Text>}</ScrollView><RestaurantNavigation /></SafeAreaView>;
}
