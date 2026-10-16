import { formatAddress, type SavedAddress } from '@/lib/addresses';
import { deviceStorage } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { useFood } from '@/providers/food-provider';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const Context = createContext<{ addresses: SavedAddress[]; loading: boolean; error: string | null; save: (address: SavedAddress) => Promise<void>; remove: (id: string) => Promise<void>; select: (address: SavedAddress) => Promise<void> } | null>(null);
export function AddressProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { address: activeAddress, setAddress } = useFood();
  const [state, setState] = useState<{ owner: string; addresses: SavedAddress[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const load = async () => {
      try { const raw = await deviceStorage.getItem(`addresses.${userId}`); const parsed = raw ? JSON.parse(raw) : []; if (!Array.isArray(parsed)) throw new Error(); if (active) { setState({ owner: userId, addresses: parsed }); setError(null); } }
      catch { if (active) setError('Could not load saved addresses. Please reopen this page.'); }
    };
    void load(); return () => { active = false; };
  }, [userId]);
  const addresses = state && state.owner === userId ? state.addresses : [];
  const persist = async (values: SavedAddress[]) => {
    if (!userId) throw new Error('Please sign in again.');
    await deviceStorage.setItem(`addresses.${userId}`, JSON.stringify(values));
    setState({ owner: userId, addresses: values });
  };
  const save = async (value: SavedAddress) => {
    if (pending.current) throw new Error('Please wait for the current address change.');
    if (state?.owner !== userId) throw new Error('Please wait for saved addresses to load.');
    pending.current = true;
    try { await persist([...addresses.filter(item => item.id !== value.id), value]); await setAddress(formatAddress(value)); }
    finally { pending.current = false; }
  };
  const remove = async (id: string) => {
    if (pending.current) return;
    pending.current = true;
    try { const removed = addresses.find(value => value.id === id); const remaining = addresses.filter(value => value.id !== id); await persist(remaining); if (removed && formatAddress(removed) === activeAddress) await setAddress(remaining[0] ? formatAddress(remaining[0]) : ''); }
    finally { pending.current = false; }
  };
  return <Context.Provider value={{ addresses, loading: !!userId && state?.owner !== userId, error, save, remove, select: value => setAddress(formatAddress(value)) }}>{children}</Context.Provider>;
}
export function useAddresses() { const value = useContext(Context); if (!value) throw new Error('AddressProvider required'); return value; }
