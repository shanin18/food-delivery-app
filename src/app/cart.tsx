import { Colors, Fonts } from '@/constants/theme';
import { dishes, restaurants } from '@/data/catalog';
import { useFood } from '@/providers/food-provider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
  const { items, updateQuantity, removeItem, address, setAddress } = useFood();
  const [editing, setEditing] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [draftAddress, setDraftAddress] = useState(address);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState(false);
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const money = (value: number) => `$${value.toFixed(2).replace(/\.00$/, '')}`;
  const back = () => router.canGoBack() ? router.back() : router.replace('/home');
  const placeOrder = () => {
    if (!address.trim() || editingAddress) {
      setAddressError('Please enter and save your delivery address before placing your order.');
      if (!editingAddress) setDraftAddress(address);
      setEditingAddress(true);
      return;
    }
    setAddressError(null);
    Alert.alert('Checkout is not available yet', 'Your cart is ready. Ordering and payment still need to be connected before an order can be placed.');
  };
  return <SafeAreaView style={styles.screen}>
    <KeyboardAvoidingView style={styles.layout} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={styles.back}><Ionicons name="chevron-back" size={22} color={Colors.text} /></Pressable><Text style={styles.headerTitle}>Cart</Text><View style={{ flex: 1 }} />{!!items.length && <Pressable accessibilityRole="button" onPress={() => setEditing(value => !value)} hitSlop={10}><Text style={[styles.edit, editing && { color: '#179C64' }]}>{editing ? 'DONE' : 'EDIT ITEMS'}</Text></Pressable>}</View>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.items}>
        {items.map(item => {
          const dish = dishes.find(value => value.id === item.dishId);
          if (!dish) return null;
          const photo = dish.image ?? restaurants.find(value => value.id === dish.restaurantId)?.image;
          return <View key={`${item.dishId}-${item.size}`} style={styles.item}>
            <Pressable accessibilityRole="button" accessibilityLabel={`View ${dish.name}`} onPress={() => router.push({ pathname: '/food-details', params: { id: dish.id } })} style={styles.photo}>{photo && <Image source={photo} style={StyleSheet.absoluteFill} resizeMode={dish.image ? 'contain' : 'cover'} />}</Pressable>
            <View style={styles.itemContent}><View style={styles.itemHeading}><Text style={styles.name}>{dish.name}</Text>{editing && <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${dish.name}`} onPress={() => removeItem(item.dishId, item.size)} style={styles.remove}><Ionicons name="close" size={16} color={Colors.white} /></Pressable>}</View><Text style={styles.itemPrice}>{money(item.unitPrice * item.quantity)}</Text><View style={styles.itemFooter}><Text style={styles.size}>{item.size}{dish.category === 'Pizza' ? '″' : ''}</Text><View style={styles.counter}><Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${dish.name} quantity`} disabled={item.quantity <= 1} onPress={() => updateQuantity(item.dishId, item.size, item.quantity - 1)} style={[styles.counterButton, item.quantity <= 1 && styles.disabled]}><Ionicons name="remove" size={16} color={Colors.text} /></Pressable><Text style={styles.count}>{item.quantity}</Text><Pressable accessibilityRole="button" accessibilityLabel={`Increase ${dish.name} quantity`} disabled={item.quantity >= 99} onPress={() => updateQuantity(item.dishId, item.size, item.quantity + 1)} style={styles.counterButton}><Ionicons name="add" size={16} color={Colors.text} /></Pressable></View></View></View>
          </View>;
        })}
        {!items.length && <View style={styles.empty}><Ionicons name="bag-handle-outline" size={60} color={Colors.primary} /><Text style={styles.emptyTitle}>Your cart is empty</Text><Text style={styles.emptyText}>Find something delicious to get started.</Text><Pressable accessibilityRole="button" onPress={() => router.push('/food-category')} style={styles.order}><Text style={styles.orderText}>BROWSE FOOD</Text></Pressable></View>}
      </ScrollView>
      {!!items.length && <View style={styles.checkout}>
        <View style={styles.addressHeader}><Text style={styles.label}>DELIVERY ADDRESS</Text><Pressable accessibilityRole="button" onPress={() => { if (editingAddress) { if (draftAddress.trim()) { setAddress(draftAddress.trim()); setEditingAddress(false); setAddressError(null); } else { setAddressError("Please enter your delivery address."); } } else { setDraftAddress(address); setEditingAddress(true); } }} hitSlop={10}><Text style={styles.edit}>{editingAddress ? 'SAVE' : 'EDIT'}</Text></Pressable></View>
        {editingAddress ? <TextInput accessibilityLabel="Delivery address" autoFocus multiline value={draftAddress} onChangeText={setDraftAddress} placeholder="Enter your full delivery address" maxLength={300} style={[styles.addressInput, addressError && styles.addressInvalid]} /> : <Pressable accessibilityRole="button" accessibilityLabel="Edit delivery address" onPress={() => { setDraftAddress(address); setEditingAddress(true); }} style={styles.addressBox}><Text style={styles.addressText}>{address || 'Add your delivery address'}</Text></Pressable>}
        {addressError && <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.addressError}>{addressError}</Text>}
        <View style={styles.totalRow}><Text style={styles.label}>TOTAL:</Text><Text style={styles.total}>{money(total)}</Text><View style={{ flex: 1 }} /><Pressable accessibilityRole="button" accessibilityState={{ expanded: breakdown }} onPress={() => setBreakdown(value => !value)} style={styles.breakdownButton}><Text style={styles.breakdownText}>Breakdown</Text><Ionicons name={breakdown ? 'chevron-up' : 'chevron-forward'} size={14} color={Colors.textSecondary} /></Pressable></View>
        {breakdown && <View style={styles.breakdown}><View style={styles.breakdownRow}><Text style={styles.addressText}>Food subtotal</Text><Text style={styles.addressText}>{money(total)}</Text></View><Text style={styles.emptyText}>Delivery fees and taxes will be calculated at checkout.</Text></View>}
        <Pressable accessibilityRole="button" onPress={placeOrder} style={styles.order}><Text style={styles.orderText}>PLACE ORDER</Text></Pressable>
      </View>}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  layout: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingVertical: 20 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Fonts.regular, fontSize: 18, color: Colors.text },
  edit: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.primary, textDecorationLine: 'underline' },
  items: { paddingHorizontal: 24, paddingBottom: 24, flexGrow: 1 },
  item: { flexDirection: 'row', gap: 20, marginBottom: 28 },
  photo: { width: 112, height: 112, borderRadius: 20, overflow: 'hidden' },
  itemContent: { flex: 1, justifyContent: 'space-between' },
  itemHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  name: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.text, lineHeight: 23, flex: 1 },
  remove: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center' },
  itemPrice: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.text, marginVertical: 8 },
  itemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  size: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
  count: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.text },
  disabled: { opacity: 0.4 },
  checkout: { padding: 24, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: Colors.white, boxShadow: '0px -6px 30px rgba(32,36,50,0.06)' },
  addressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  label: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary },
  addressBox: { padding: 18, minHeight: 60, borderRadius: 10, backgroundColor: Colors.surfaceSecondary },
  addressInput: { padding: 18, minHeight: 60, maxHeight: 110, borderRadius: 10, backgroundColor: Colors.surfaceSecondary, fontFamily: Fonts.regular, fontSize: 14, color: Colors.text },
  addressInvalid: { borderWidth: 1, borderColor: Colors.error },
  addressError: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 20, color: Colors.error, marginTop: 10 },
  addressText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  totalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 26 },
  total: { fontFamily: Fonts.regular, fontSize: 26, color: Colors.darkBackground },
  breakdownButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  breakdownText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.primary },
  breakdown: { marginBottom: 20, gap: 8 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  order: { width: '100%', padding: 22, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center' },
  orderText: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.white },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.text },
  emptyText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
});
