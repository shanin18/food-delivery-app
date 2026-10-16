import { dishes } from '@/data/catalog';
export type RestaurantOrder = { id: string; dishId: string; name: string; category: string; amount: number; status: 'running' | 'requested' | 'completed' | 'cancelled'; createdAt: string };
export const restaurantReviews = [
  { id: 'r1', name: 'Amelia Brown', rating: 5, comment: 'Fresh food, lovely flavours, and everything arrived warm.' },
  { id: 'r2', name: 'Daniel Wilson', rating: 5, comment: 'The burgers were excellent. Will definitely order again.' },
  { id: 'r3', name: 'Sophia Ahmed', rating: 4, comment: 'Great portions and quick preparation.' },
  { id: 'r4', name: 'Oliver Khan', rating: 5, comment: 'A favourite for lunch. The food is always delicious.' },
];
export function initialRestaurantOrders(now = new Date()): RestaurantOrder[] {
  const foods = dishes.filter(dish => dish.image);
  const active: RestaurantOrder[] = Array.from({ length: 25 }, (_, index) => {
    const dish = foods[index % foods.length];
    return { id: `320${53 + index}`, dishId: dish.id, name: dish.name, category: index % 2 ? 'Lunch' : 'Breakfast', amount: dish.price, status: index < 20 ? 'running' : 'requested', createdAt: now.toISOString() };
  });
  const completed: RestaurantOrder[] = [120, 280, 500, 300, 420, 260, 361].map((amount, index) => {
    const date = new Date(now); date.setHours(10 + index, 0, 0, 0);
    return { id: `completed-${index}`, dishId: foods[index % foods.length].id, name: foods[index % foods.length].name, category: 'Lunch', amount, status: 'completed', createdAt: date.toISOString() };
  });
  return [...active, ...completed];
}
export function updateRestaurantOrder(orders: RestaurantOrder[], id: string, action: 'accept' | 'done' | 'cancel') {
  return orders.map(order => order.id !== id || (order.status !== 'running' && order.status !== 'requested') ? order : { ...order, status: action === 'cancel' ? 'cancelled' as const : action === 'accept' ? 'running' as const : 'completed' as const });
}
