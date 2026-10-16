import { useOrderHistory } from "@/hooks/use-order-history";
import { cancelOrder, type Order } from "@/lib/orders";
import { dishes } from "@/data/catalog";
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { type DemoCard, type PaymentMethod } from '@/lib/payment';
import { useFood } from '@/providers/food-provider';

const Context = createContext<{
  cards: DemoCard[]; selectedCard: string | null; method: PaymentMethod; order: Order | null; orders: Order[]; ordersLoading: boolean; storageError: string | null; cancel: (id: string) => void; complete: (id: string) => void; rate: (id: string, stars: number) => void;
  setMethod: (method: PaymentMethod) => void; selectCard: (id: string) => void;
  saveCard: (card: DemoCard) => void; confirm: (card?: DemoCard) => void;
} | null>(null);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const { items, address, clearCart } = useFood();
  const [cards, setCards] = useState<DemoCard[]>([]);
  const [selectedCard, selectCard] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('Mastercard');
  const { orders, setOrders, ordersLoading, storageError } = useOrderHistory();
  const order = orders[0] ?? null;
  const cancel = (id: string) => setOrders(current => cancelOrder(current, id));
  const complete = (id: string) => setOrders(current => current.map(value => value.id === id && value.status === "ongoing" ? { ...value, status: "completed" } : value));
  const rate = (id: string, stars: number) => setOrders(current => current.map(value => value.id === id && value.status === "completed" ? { ...value, rating: Math.max(1, Math.min(5, stars)) } : value));
  const confirming = useRef(false);
  const saveCard = (card: DemoCard) => {
    setCards(current => [...current.filter(item => item.id !== card.id), card]);
    selectCard(card.id);
    setMethod(card.brand);
  };
  const confirm = (card?: DemoCard) => {
    if (ordersLoading || storageError) throw new Error(storageError ?? 'Please wait while your order history loads.');
    if (confirming.current) throw new Error('This checkout has already been confirmed.');
    if (!items.length) throw new Error('Your cart is empty. Add food before checking out.');
    if (!address.trim()) throw new Error('Save your delivery address before checking out.');
    const paymentMethod = card?.brand ?? method;
    if ((paymentMethod === 'Visa' || paymentMethod === 'Mastercard') && !card && !cards.some(item => item.id === selectedCard && item.brand === paymentMethod)) throw new Error('Add or select a card first.');
    confirming.current = true;
    try {
      const nextOrder: Order = { status: "ongoing", id: `FD-${Date.now()}`, total: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), quantity: items.reduce((sum, item) => sum + item.quantity, 0), address: address.trim(), method: paymentMethod, createdAt: new Date().toISOString(), items: items.map(item => { const dish = dishes.find(value => value.id === item.dishId); return { dishId: item.dishId, name: dish?.name ?? "Food", quantity: item.quantity, size: item.size, unitPrice: item.unitPrice, restaurantId: dish?.restaurantId ?? 1 }; }) };
      setOrders(current => [nextOrder, ...current]);
      clearCart();
    } finally { confirming.current = false; }
  };
  return <Context.Provider value={{ cards, selectedCard, method, order, orders, ordersLoading, storageError, cancel, complete, rate, setMethod, selectCard, saveCard, confirm }}>{children}</Context.Provider>;
}
export function usePayment() {
  const value = useContext(Context);
  if (!value) throw new Error('PaymentProvider is required');
  return value;
}
