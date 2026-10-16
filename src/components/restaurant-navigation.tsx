import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname, type Href } from 'expo-router';
import { View } from 'react-native';
export function RestaurantNavigation() {
  const path = usePathname();
  const tabs = [{ label: 'Dashboard', icon: 'grid-outline', route: '/restaurant/dashboard' }, { label: 'My Food List', icon: 'list-outline', route: '/restaurant/food-list' }, { label: 'Add food item', icon: 'add', route: '/restaurant/food-edit' }, { label: 'Notifications', icon: 'notifications-outline', route: '/restaurant/notifications' }, { label: 'Restaurant profile', icon: 'person-outline', route: '/restaurant/account' }] as const;
  return <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: Colors.white }}>{tabs.map((tab, index) => <Pressable key={tab.label} accessibilityRole="button" accessibilityLabel={tab.label} accessibilityState={{ selected: path === tab.route }} onPress={() => path !== tab.route && router.navigate(tab.route as Href)} style={{ width: index === 2 ? 54 : 44, height: index === 2 ? 54 : 44, borderRadius: 27, borderWidth: index === 2 ? 1 : 0, borderColor: Colors.primary, backgroundColor: index === 2 || path === tab.route ? '#FFF2E9' : Colors.white, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={tab.icon} size={index === 2 ? 30 : 23} color={path === tab.route || index === 2 ? Colors.primary : Colors.imagePlaceholder} /></Pressable>)}</View>;
}
