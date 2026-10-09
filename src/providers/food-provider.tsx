import { createContext, useContext, useState, type ReactNode } from 'react';

type CartItem = { dishId: string; size: string; quantity: number; unitPrice: number };
const FoodContext = createContext<{
  items: CartItem[]; favorites: string[];
  addItem: (item: CartItem) => void; toggleFavorite: (id: string) => void;
  updateQuantity: (dishId: string, size: string, quantity: number) => void;
  removeItem: (dishId: string, size: string) => void;
  address: string; setAddress: (value: string) => void;
  clearCart: () => void;
} | null>(null);

export function FoodProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const updateQuantity = (dishId: string, size: string, quantity: number) => setItems(current => current.map(item => item.dishId === dishId && item.size === size ? { ...item, quantity: Math.max(1, Math.min(99, quantity)) } : item));
  const removeItem = (dishId: string, size: string) => setItems(current => current.filter(item => item.dishId !== dishId || item.size !== size));
  const addItem = (item: CartItem) => setItems(current => {
    const existing = current.find(value => value.dishId === item.dishId && value.size === item.size);
    return existing ? current.map(value => value === existing ? { ...value, quantity: value.quantity + item.quantity } : value) : [...current, item];
  });
  const toggleFavorite = (id: string) => setFavorites(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  return <FoodContext.Provider value={{ items, favorites, addItem, toggleFavorite, updateQuantity, removeItem, address, setAddress, clearCart: () => setItems([]) }}>{children}</FoodContext.Provider>;
}

export function useFood() {
  const context = useContext(FoodContext);
  if (!context) throw new Error('FoodProvider is required');
  return context;
}
