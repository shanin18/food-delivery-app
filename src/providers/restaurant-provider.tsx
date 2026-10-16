import { dishes } from '@/data/catalog';
import { initialRestaurantOrders, updateRestaurantOrder, type RestaurantOrder } from '@/data/restaurant-dashboard';
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';
export type RestaurantFood = { id: string; name: string; price: number; category: 'Breakfast' | 'Lunch' | 'Dinner'; image: ImageSourcePropType; photos: string[]; pickup: boolean; delivery: boolean; ingredients: string[]; description: string; rating: number; reviews: number };
export const ingredientOptions = ['Salt', 'Chicken', 'Onion', 'Garlic', 'Peppers', 'Ginger', 'Avocado', 'Apple', 'Blueberry', 'Broccoli', 'Orange', 'Walnut'];
const Context = createContext<{ menu: RestaurantFood[]; orders: RestaurantOrder[]; saveFood: (food: RestaurantFood) => void; deleteFood: (id: string) => void; action: (id: string, action: 'accept' | 'done' | 'cancel') => void; account: { restaurant_name: string; location: string } } | null>(null);
export function RestaurantProvider({ children, account }: { children: ReactNode; account: { restaurant_name: string; location: string } }) {
  const [menu, setMenu] = useState<RestaurantFood[]>(() => dishes.filter(dish => dish.image).map((dish, index) => ({ id: dish.id, name: dish.name, price: dish.price, category: index % 3 === 0 ? 'Breakfast' : index % 3 === 1 ? 'Lunch' : 'Dinner', image: dish.image, photos: [], pickup: true, delivery: true, ingredients: dish.ingredients, description: dish.description, rating: 4.9, reviews: 10 })));
  const [orders, setOrders] = useState(() => initialRestaurantOrders());
  const saveFood = (food: RestaurantFood) => setMenu(current => current.some(value => value.id === food.id) ? current.map(value => value.id === food.id ? food : value) : [...current, food]);
  const deleteFood = (id: string) => setMenu(current => current.filter(value => value.id !== id));
  return <Context.Provider value={{ menu, orders, account, saveFood, deleteFood, action: (id, action) => setOrders(current => updateRestaurantOrder(current, id, action)) }}>{children}</Context.Provider>;
}
export function useRestaurant() { const value = useContext(Context); if (!value) throw new Error('RestaurantProvider required'); return value; }
