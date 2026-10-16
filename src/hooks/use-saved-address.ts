import { useAuth } from '@/providers/auth-provider';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export function useSavedAddress() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [saved, setSaved] = useState<{ userId: string; value: string } | null>(null);
  const [loadedUser, setLoadedUser] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const revision = useRef(0);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const version = ++revision.current;
    const key = `delivery-address.${userId}`;
    const load = async () => {
      try {
        const value = Platform.OS === 'web' ? window.localStorage.getItem(key) : await SecureStore.getItemAsync(key);
        if (active && version === revision.current) { setSaved({ userId, value: value ?? '' }); setStorageError(null); }
      } catch { if (active) setStorageError('Could not restore your saved address. Please try reopening the app.'); }
      finally { if (active) setLoadedUser(userId); }
    };
    void load();
    return () => { active = false; };
  }, [userId]);
  const setAddress = async (value: string) => {
    if (!userId) throw new Error('Sign in before saving your address.');
    const address = value.trim();
    if (address.length > 300) throw new Error('Enter a delivery address of up to 300 characters.');
    const key = `delivery-address.${userId}`;
    try {
      if (Platform.OS === 'web') window.localStorage.setItem(key, address);
      else await SecureStore.setItemAsync(key, address);
    } catch { throw new Error('Could not save your address. Please try again.'); }
    revision.current++;
    setSaved({ userId, value: address });
    setStorageError(null);
    setLoadedUser(userId);
  };
  return { address: saved && saved.userId === userId ? saved.value : '', setAddress, addressLoading: !!userId && loadedUser !== userId, addressStorageError: storageError };
}
