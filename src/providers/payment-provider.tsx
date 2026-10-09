import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { type DemoCard, type PaymentMethod } from '@/lib/payment';
import { useFood } from '@/providers/food-provider';

type DemoOrder = { id: string; total: number; address: string; method: PaymentMethod; quantity: number; createdAt: string };
const Context = createContext<{
  cards: DemoCard[]; selectedCard: string | null; method: PaymentMethod; order: DemoOrder | null;
  setMethod: (method: PaymentMethod) => void; selectCard: (id: string) => void;
  saveCard: (card: DemoCard) => void; confirm: (card?: DemoCard) => void;
} | null>(null);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const { items, address, clearCart } = useFood();
  const [cards, setCards] = useState<DemoCard[]>([]);
  const [selectedCard, selectCard] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('Mastercard');
  const [order, setOrder] = useState<DemoOrder | null>(null);
  const confirming = useRef(false);
  const saveCard = (card: DemoCard) => {
    setCards(current => [...current.filter(item => item.id !== card.id), card]);
    selectCard(card.id);
    setMethod(card.brand);
  };
  const confirm = (card?: DemoCard) => {
    if (confirming.current) throw new Error('This checkout has already been confirmed.');
    if (!items.length) throw new Error('Your cart is empty. Add food before checking out.');
    if (!address.trim()) throw new Error('Save your delivery address before checking out.');
    const paymentMethod = card?.brand ?? method;
    if ((paymentMethod === 'Visa' || paymentMethod === 'Mastercard') && !card && !cards.some(item => item.id === selectedCard && item.brand === paymentMethod)) throw new Error('Add or select a card first.');
    confirming.current = true;
    try {
      setOrder({ id: `FD-${Date.now()}`, total: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), quantity: items.reduce((sum, item) => sum + item.quantity, 0), address: address.trim(), method: paymentMethod, createdAt: new Date().toISOString() });
      clearCart();
    } finally { confirming.current = false; }
  };
  return <Context.Provider value={{ cards, selectedCard, method, order, setMethod, selectCard, saveCard, confirm }}>{children}</Context.Provider>;
}
export function usePayment() {
  const value = useContext(Context);
  if (!value) throw new Error('PaymentProvider is required');
  return value;
}
