import type { PaymentMethod } from '@/lib/payment';
export type Order = { id: string; total: number; address: string; method: PaymentMethod; quantity: number; createdAt: string; status: 'ongoing' | 'completed' | 'cancelled'; rating?: number; items: { dishId: string; name: string; quantity: number; restaurantId: number; size: string; unitPrice: number }[] };
export function cancelOrder(orders: Order[], id: string) {
  return orders.map(order => order.id === id && order.status === 'ongoing' ? { ...order, status: 'cancelled' as const } : order);
}
