import { sampleCourier } from "@/data/courier";
import TrackingMap from '@/components/tracking-map';
import { Colors, Fonts } from '@/constants/theme';
import { dishes, restaurants } from '@/data/catalog';
import { usePayment } from '@/providers/payment-provider';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Image, PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const steps = ['Your order has been received', 'The restaurant is preparing your food', 'Your order has been picked up for delivery', 'Order arriving soon!'];
export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { order: latestOrder, orders, complete } = usePayment();
  const order = orderId ? orders.find(value => value.id === orderId) ?? null : latestOrder;
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const available = height - insets.top - insets.bottom;
  const collapsedHeight = Math.min(260, available * 0.48);
  const expandedHeight = available * 0.78;
  const [expanded, setExpanded] = useState(false);
  const [sheetHeight] = useState(() => new Animated.Value(collapsedHeight));
  const dragStart = useRef(collapsedHeight);
  const currentHeight = useRef(collapsedHeight);
  const scrollOffset = useRef(0);
  useEffect(() => { const listener = sheetHeight.addListener(({ value }) => { currentHeight.current = value; }); return () => sheetHeight.removeListener(listener); }, [sheetHeight]);
  useEffect(() => { Animated.spring(sheetHeight, { toValue: expanded ? expandedHeight : collapsedHeight, useNativeDriver: false, stiffness: 240, damping: 30, mass: 1, overshootClamping: true }).start(); }, [expanded, expandedHeight, collapsedHeight, sheetHeight]);
  // PanResponder stores these callbacks; refs are accessed only during gestures.
  // eslint-disable-next-line react-hooks/refs
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderGrant: () => { sheetHeight.stopAnimation(); dragStart.current = currentHeight.current; },
    onPanResponderMove: (_, g) => sheetHeight.setValue(Math.max(collapsedHeight, Math.min(expandedHeight, dragStart.current - g.dy))),
    onPanResponderRelease: (_, g) => {
      const open = Math.abs(g.vy) > 0.35 ? g.vy < 0 : currentHeight.current > (collapsedHeight + expandedHeight) / 2;
      setExpanded(open);
      Animated.spring(sheetHeight, { toValue: open ? expandedHeight : collapsedHeight, useNativeDriver: false, stiffness: 240, damping: 30, mass: 1, overshootClamping: true }).start();
    },
    onPanResponderTerminate: () => { Animated.spring(sheetHeight, { toValue: expanded ? expandedHeight : collapsedHeight, useNativeDriver: false, stiffness: 240, damping: 30 }).start(); },
  }), [collapsedHeight, expandedHeight, expanded, sheetHeight]);
  const restaurant = restaurants.find(value => value.id === order?.items[0]?.restaurantId);
  const food = dishes.find(value => value.id === order?.items[0]?.dishId);
  return <SafeAreaView style={styles.safe}>
    <View style={styles.screen}>
      <TrackingMap />
      <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.canGoBack() ? router.back() : router.replace('/home')} style={styles.back}><Ionicons name="chevron-back" size={22} color={Colors.white} /></Pressable><Text style={styles.headerTitle}>Track Order</Text></View>
      <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
        <View {...pan.panHandlers} style={styles.dragZone}>
          <Pressable accessibilityRole="button" accessibilityLabel={expanded ? 'Collapse tracking panel' : 'Expand tracking panel'} accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={styles.handleButton}><View style={styles.handle} /></Pressable>
          <View style={styles.summary}>{(food?.image || restaurant?.image) && <Image source={food?.image ?? restaurant!.image} style={styles.photo} resizeMode={food?.image ? 'contain' : 'cover'} />}<View style={styles.details}><Text style={styles.title}>{restaurant?.name ?? 'Your order'}</Text>{order ? <><Text style={styles.date}>Ordered at {new Date(order.createdAt).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' })}</Text><Text numberOfLines={2} style={styles.item}>{order.items.map(item => `${item.quantity}x ${item.name}`).join('\n')}</Text></> : <Text style={styles.date}>Place an order to see its details.</Text>}</View></View>
        </View>
        <ScrollView style={styles.stepsScroll} scrollEnabled={expanded} showsVerticalScrollIndicator={false} onScroll={event => { scrollOffset.current = event.nativeEvent.contentOffset.y; }} scrollEventThrottle={16} onScrollEndDrag={event => { if (scrollOffset.current < -35) setExpanded(false); }} contentContainerStyle={styles.stepsContent}>
          <Text style={styles.eta}>{order?.status === "completed" ? "Delivered" : order?.status === "cancelled" ? "Cancelled" : "20 min"}</Text><Text style={styles.etaLabel}>ESTIMATED DELIVERY TIME · PREVIEW</Text>
          {steps.map((step, index) => <View key={step} style={styles.step}><View style={styles.rail}>{index < steps.length - 1 && <View style={[styles.line, index === 0 && { backgroundColor: Colors.primary }]} />}<View style={styles.stepIcon}><Ionicons name={index === 0 ? 'checkmark-circle' : index === 1 ? 'restaurant-outline' : 'checkmark-circle'} size={18} color={index < 2 ? Colors.primary : '#C3C7CD'} /></View></View><Text style={[styles.stepText, index === 0 && { color: Colors.primary }]}>{step}</Text></View>)}
          <Text style={styles.preview}>Route preview · Live tracking unavailable</Text>
          {order?.status === 'ongoing' && <Pressable accessibilityRole="button" onPress={() => Alert.alert('Received your food?', 'Confirm only after your order arrives.', [{ text: 'Not yet', style: 'cancel' }, { text: 'Confirm received', onPress: () => { complete(order.id); router.replace('/my-orders'); } }])} style={{ paddingVertical: 14 }}><Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: Colors.primary }}>Confirm order received</Text></Pressable>}
        </ScrollView>
        <View style={styles.contact}><Image source={sampleCourier.image} style={styles.avatar} /><View style={styles.details}><Text style={styles.title}>{sampleCourier.name}</Text><Text style={styles.role}>{sampleCourier.role}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Call courier" onPress={() => router.push('/courier-call')} style={styles.call}><Ionicons name="call-outline" size={20} color={Colors.white} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Message courier" onPress={() => router.push({ pathname: '/courier-message', params: { orderId: order?.id } })} style={styles.message}><FontAwesome5 name="facebook-messenger" size={21} color={Colors.primary} /></Pressable></View>
      </Animated.View>
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white }, screen: { flex: 1 },
  header: { position: 'absolute', top: 16, left: 24, right: 24, flexDirection: 'row', alignItems: 'center', gap: 16 }, back: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.darkBackground, alignItems: 'center', justifyContent: 'center' }, headerTitle: { fontFamily: Fonts.medium, fontSize: 18, color: Colors.text, backgroundColor: '#FFFFFFDD', padding: 8, borderRadius: 10 },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', boxShadow: '0 -8px 32px rgba(18,18,35,0.08)' },
  dragZone: { paddingHorizontal: 24 }, handleButton: { height: 32, alignItems: 'center', justifyContent: 'center' }, handle: { width: 60, height: 6, borderRadius: 3, backgroundColor: '#D8E3ED' }, summary: { flexDirection: 'row', gap: 14, paddingBottom: 14, alignItems: 'flex-start' }, photo: { width: 64, height: 64, borderRadius: 12 }, details: { flex: 1 }, title: { fontFamily: Fonts.medium, fontSize: 16, color: Colors.text }, date: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.imagePlaceholder, lineHeight: 20, marginTop: 4, marginBottom: 6 }, item: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.textSecondary, lineHeight: 20 },
  stepsScroll: { flex: 1, minHeight: 0 }, stepsContent: { paddingHorizontal: 24, paddingBottom: 12 }, eta: { fontFamily: Fonts.extraBold, fontSize: 28, color: Colors.text, textAlign: 'center', marginTop: 8 }, etaLabel: { fontFamily: Fonts.regular, fontSize: 10, color: Colors.imagePlaceholder, textAlign: 'center', marginTop: 6, marginBottom: 24 }, step: { flexDirection: 'row', minHeight: 46, gap: 14 }, rail: { width: 20, alignItems: 'center' }, line: { position: 'absolute', top: 10, bottom: -10, width: 1, backgroundColor: '#D6DAE0' }, stepIcon: { backgroundColor: Colors.white, paddingVertical: 2 }, stepText: { flex: 1, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 22, color: Colors.imagePlaceholder }, preview: { fontFamily: Fonts.regular, fontSize: 10, color: Colors.textSecondary, marginTop: 4 },
  contact: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: 24, paddingVertical: 16 }, avatar: { width: 44, height: 44, borderRadius: 22 }, role: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.imagePlaceholder, marginTop: 4 }, call: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, message: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
