import { InteractivePressable as Pressable } from '@/components/interactive-pressable';
import { Colors, Fonts } from '@/constants/theme';
import { useRestaurant } from '@/providers/restaurant-provider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Animated, Image, Modal, PanResponder, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function RestaurantPopularSheet({ onClose }: { onClose: () => void }) {
  const { menu } = useRestaurant();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [offset] = useState(() => new Animated.Value(0));
  const restore = () => Animated.spring(offset, { toValue: 0, useNativeDriver: true, damping: 24, stiffness: 240 }).start();
  const dismiss = () => Animated.timing(offset, { toValue: height, duration: 220, useNativeDriver: true }).start(({ finished }) => { if (finished) onClose(); });
  const gesture = PanResponder.create({
    onMoveShouldSetPanResponder: (_, state) => Math.abs(state.dy) > 6 && Math.abs(state.dy) > Math.abs(state.dx),
    onPanResponderGrant: () => offset.stopAnimation(),
    onPanResponderMove: (_, state) => offset.setValue(Math.max(0, state.dy)),
    onPanResponderRelease: (_, state) => { if (state.dy > 100 || state.vy > 0.8) dismiss(); else restore(); },
    onPanResponderTerminate: restore,
  });
  return <Modal transparent visible animationType="slide" onRequestClose={dismiss}>
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} accessibilityRole="button" accessibilityLabel="Close popular items" />
      <Animated.View style={[styles.sheet, { height: Math.min(height * 0.78, height - insets.top - 16), paddingBottom: insets.bottom, transform: [{ translateY: offset }] }]}>
        <View {...gesture.panHandlers} style={styles.dragArea}>
          <View style={styles.handle} />
          <View style={styles.heading}><Text style={styles.title}>Popular Items This Week</Text><Pressable onPress={dismiss} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}><Ionicons name="close" size={22} color={Colors.textSecondary} /></Pressable></View>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {menu.map(item => <Pressable feedback="row" key={item.id} accessibilityRole="button" onPress={() => { onClose(); router.push({ pathname: '/restaurant/food-view', params: { id: item.id } }); }} style={styles.row}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <View style={styles.info}><Text style={styles.category}>{item.category}</Text><Text style={styles.name}>{item.name}</Text><Text style={styles.price}>${item.price.toFixed(2)}</Text></View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </Pressable>)}
          {!menu.length && <Text style={styles.name}>No items yet. Add your first menu item.</Text>}
        </ScrollView>
      </Animated.View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(45,69,88,0.68)' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  dragArea: { paddingTop: 12, paddingHorizontal: 24, paddingBottom: 20 },
  handle: { width: 60, height: 5, borderRadius: 3, backgroundColor: '#C4CED8', alignSelf: 'center', marginBottom: 24 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { fontFamily: Fonts.medium, fontSize: 17, color: Colors.text, flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  image: { width: 84, height: 84, borderRadius: 16 },
  info: { flex: 1, gap: 6 },
  category: { fontFamily: Fonts.regular, color: Colors.primary, fontSize: 12 },
  name: { fontFamily: Fonts.bold, color: Colors.text, fontSize: 14 },
  price: { fontFamily: Fonts.regular, color: Colors.textSecondary, fontSize: 14 },
});
