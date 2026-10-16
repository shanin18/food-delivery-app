import type { Order } from '@/lib/orders';
import { deviceStorage } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { useEffect, useRef, useState, type SetStateAction } from 'react';

export function useOrderHistory() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [state, setState] = useState<{ owner: string; orders: Order[] } | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const writes = useRef<Promise<unknown>>(Promise.resolve());
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const load = async () => {
      try {
        await writes.current;
        const raw = await deviceStorage.getItem(`order-history.${userId}`);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) throw new Error('Invalid order history');
        if (active) { setState({ owner: userId, orders: parsed as Order[] }); setStorageError(null); }
      } catch { if (active) setStorageError('Could not load order history. Restart the app to try again.'); }
    };
    void load();
    return () => { active = false; };
  }, [userId]);
  useEffect(() => {
    if (!state || state.owner !== userId) return;
    const snapshot = JSON.stringify(state.orders);
    writes.current = writes.current.catch(() => undefined).then(() => deviceStorage.setItem(`order-history.${state.owner}`, snapshot)).catch(() => { setStorageError('Could not save order history on this device.'); });
  }, [state, userId]);
  const setOrders = (update: SetStateAction<Order[]>) => setState(current => {
    if (!userId || current?.owner !== userId) return current;
    return { owner: userId, orders: typeof update === 'function' ? update(current.orders) : update };
  });
  return { orders: state?.owner === userId ? state?.orders ?? [] : [], setOrders, ordersLoading: !!userId && state?.owner !== userId, storageError };
}
