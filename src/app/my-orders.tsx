import { Colors, Fonts } from '@/constants/theme';
import { dishes, restaurants } from '@/data/catalog';
import type { Order } from '@/lib/orders';
import { useFood } from '@/providers/food-provider';
import { usePayment } from '@/providers/payment-provider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyOrdersScreen() {
  const { orders, ordersLoading, storageError, cancel, rate } = usePayment();
  const { addItem } = useFood();
  const [tab, setTab] = useState<'ongoing' | 'history'>('ongoing');
  const [ratingOrder, setRatingOrder] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const visible = orders.filter(order => tab === 'ongoing' ? order.status === 'ongoing' : order.status !== 'ongoing');
  const reorder = (order: Order) => {
    for (const item of order.items) if (dishes.some(dish => dish.id === item.dishId)) addItem({ dishId: item.dishId, size: item.size, quantity: item.quantity, unitPrice: item.unitPrice });
    router.push('/cart');
  };
  return <SafeAreaView style={styles.screen}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back" style={styles.circle} onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}><Ionicons name="chevron-back" size={22} color={Colors.text} /></Pressable><Text style={styles.title}>My Orders</Text><View style={{ flex: 1 }} /><Pressable accessibilityRole="button" accessibilityLabel="Browse food" style={styles.circle} onPress={() => router.push('/food-category')}><Ionicons name="restaurant-outline" size={20} color={Colors.text} /></Pressable></View>
    <View style={styles.tabs}>{(['ongoing', 'history'] as const).map(value => <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: tab === value }} onPress={() => setTab(value)} style={[styles.tab, tab === value && styles.activeTab]}><Text style={[styles.tabText, tab === value && { color: Colors.primary }]}>{value === 'ongoing' ? 'Ongoing' : 'History'}</Text></Pressable>)}</View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {visible.map(order => {
        const restaurant = restaurants.find(value => value.id === order.items[0]?.restaurantId);
        const dish = dishes.find(value => value.id === order.items[0]?.dishId);
        const image = dish?.image ?? restaurant?.image;
        return <View key={order.id} style={styles.card}>
          <View style={styles.row}><Text style={styles.type}>Food</Text>{order.status !== 'ongoing' && <Text style={[styles.status, { color: order.status === 'completed' ? '#16A36D' : Colors.error }]}>{order.status === 'completed' ? 'Completed' : 'Cancelled'}</Text>}</View>
          <View style={styles.summary}>{image && <Image source={image} style={styles.photo} resizeMode={dish?.image ? 'contain' : 'cover'} />}<View style={{ flex: 1 }}><View style={styles.row}><Text style={styles.restaurant}>{restaurant?.name ?? order.items[0]?.name}</Text><Text style={styles.orderId}>#{order.id.replace('FD-', '').slice(-6)}</Text></View><View style={[styles.row, { marginTop: 8 }]}><Text style={styles.price}>${order.total.toFixed(2)}</Text><Text style={styles.meta}>{order.quantity} Items</Text></View>{tab === 'history' && <Text style={styles.date}>{new Date(order.createdAt).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' })}</Text>}</View></View>
          <View style={styles.buttons}>{tab === 'ongoing' ? <><Pressable accessibilityRole="button" style={styles.primary} onPress={() => router.push({ pathname: '/order-tracking', params: { orderId: order.id } })}><Text style={styles.primaryText}>Track Order</Text></Pressable><Pressable accessibilityRole="button" style={styles.outline} onPress={() => Alert.alert('Cancel order?', 'This order will move to your history.', [{ text: 'Keep Order', style: 'cancel' }, { text: 'Cancel Order', style: 'destructive', onPress: () => cancel(order.id) }])}><Text style={styles.outlineText}>Cancel</Text></Pressable></> : <>{order.status === 'completed' ? <Pressable accessibilityRole="button" style={styles.outline} onPress={() => { setRatingOrder(order.id); setStars(order.rating ?? 0); }}><Text style={styles.outlineText}>{order.rating ? `Rated ${order.rating}/5` : 'Rate'}</Text></Pressable> : <View style={{ flex: 1 }} />}<Pressable accessibilityRole="button" style={styles.primary} onPress={() => reorder(order)}><Text style={styles.primaryText}>Re-Order</Text></Pressable></>}</View>
        </View>;
      })}
      {storageError && <Text accessibilityRole="alert" style={{ color: Colors.error, marginBottom: 16 }}>{storageError}</Text>}
      {ordersLoading && <Text style={styles.meta}>Loading orders?</Text>}
      {!ordersLoading && !visible.length && <View style={styles.empty}><Ionicons name="receipt-outline" size={54} color={Colors.imagePlaceholder} /><Text style={styles.title}>{tab === 'ongoing' ? 'No ongoing orders' : 'No order history yet'}</Text><Text style={styles.meta}>{tab === 'ongoing' ? 'Your next order will appear here after checkout.' : 'Completed and cancelled orders appear here.'}</Text><Pressable accessibilityRole="button" style={styles.primary} onPress={() => router.push('/food-category')}><Text style={styles.primaryText}>Browse Food</Text></Pressable></View>}
    </ScrollView>
    <Modal transparent visible={!!ratingOrder} animationType="fade" onRequestClose={() => setRatingOrder(null)}><View style={styles.overlay}><View style={styles.ratingBox}><Text style={styles.title}>How was your order?</Text><View style={[styles.row, { justifyContent: 'center', marginVertical: 24 }]}>{[1,2,3,4,5].map(value => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`Rate ${value} stars`} onPress={() => setStars(value)} style={{ padding: 6 }}><Ionicons name={value <= stars ? 'star' : 'star-outline'} size={30} color={Colors.primary} /></Pressable>)}</View><Pressable accessibilityRole="button" disabled={!stars} style={[styles.primary, !stars && { opacity: 0.5 }]} onPress={() => { if (ratingOrder) rate(ratingOrder, stars); setRatingOrder(null); }}><Text style={styles.primaryText}>Save Rating</Text></Pressable><Pressable accessibilityRole="button" onPress={() => setRatingOrder(null)} style={{ padding: 16 }}><Text style={styles.meta}>Close</Text></Pressable></View></View></Modal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white }, header: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 24 }, circle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }, title: { fontFamily: Fonts.medium, fontSize: 18, color: Colors.text }, tabs: { flexDirection: 'row', paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: Colors.border }, tab: { flex: 1, alignItems: 'center', paddingVertical: 18, borderBottomWidth: 2, borderBottomColor: Colors.transparent }, activeTab: { borderBottomColor: Colors.primary }, tabText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.imagePlaceholder }, content: { padding: 24, flexGrow: 1 }, card: { marginBottom: 30 }, row: { flexDirection: 'row', alignItems: 'center', gap: 14 }, type: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.text }, status: { fontFamily: Fonts.bold, fontSize: 13 }, summary: { flexDirection: 'row', alignItems: 'center', gap: 14, borderTopWidth: 1, borderTopColor: Colors.border, paddingVertical: 18, marginTop: 14 }, photo: { width: 64, height: 64, borderRadius: 12 }, restaurant: { flex: 1, fontFamily: Fonts.bold, fontSize: 14, color: Colors.text }, orderId: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary, textDecorationLine: 'underline' }, price: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.text }, meta: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 20, color: Colors.textSecondary, textAlign: 'center' }, date: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.imagePlaceholder, marginTop: 6 }, buttons: { flexDirection: 'row', gap: 24 }, primary: { minWidth: 100, backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 8, alignItems: 'center' }, primaryText: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.white }, outline: { flex: 1, borderWidth: 1, borderColor: Colors.primary, paddingVertical: 14, borderRadius: 8, alignItems: 'center' }, outlineText: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.primary }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }, overlay: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(18,18,35,0.45)' }, ratingBox: { backgroundColor: Colors.white, borderRadius: 24, padding: 24, alignItems: 'center' },
});
