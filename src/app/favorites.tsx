import { FoodCard } from '@/components/food-card';
import { ProfileHeader, profileStyles as shared } from '@/components/profile-ui';
import { dishes } from '@/data/catalog';
import { useFood } from '@/providers/food-provider';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function FavoritesScreen() { const { favorites } = useFood(); const foods = dishes.filter(dish => favorites.includes(dish.id)); return <SafeAreaView style={shared.screen}><ProfileHeader title="Favourite" /><ScrollView contentContainerStyle={shared.content}><View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingTop: 12 }}>{foods.map(dish => <FoodCard key={dish.id} dish={dish} showPrice />)}</View>{!foods.length && <Text style={shared.bio}>Tap the heart on a food details page to save your favourites.</Text>}</ScrollView></SafeAreaView>; }
