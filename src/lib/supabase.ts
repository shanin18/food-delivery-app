import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Encode into ASCII chunks so even large OAuth sessions fit in Keychain values.
const storage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    const count = Number(await SecureStore.getItemAsync(`${key}.count`));
    if (!count) return null;
    const chunks = await Promise.all(Array.from({ length: count }, (_, i) => SecureStore.getItemAsync(`${key}.${i}`)));
    if (chunks.some(chunk => chunk === null)) return null;
    return decodeURIComponent(chunks.join(''));
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
      return;
    }
    const encoded = encodeURIComponent(value);
    const oldCount = Number(await SecureStore.getItemAsync(`${key}.count`));
    const chunks = encoded.match(/.{1,1800}/g) ?? [];
    // Invalidate the previous value before updating to avoid reading a partial session.
    await SecureStore.deleteItemAsync(`${key}.count`);
    for (let i = 0; i < chunks.length; i++) await SecureStore.setItemAsync(`${key}.${i}`, chunks[i]);
    await SecureStore.setItemAsync(`${key}.count`, String(chunks.length));
    for (let i = chunks.length; i < oldCount; i++) await SecureStore.deleteItemAsync(`${key}.${i}`);
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key);
      return;
    }
    const count = Number(await SecureStore.getItemAsync(`${key}.count`));
    await SecureStore.deleteItemAsync(`${key}.count`);
    for (let i = 0; i < count; i++) await SecureStore.deleteItemAsync(`${key}.${i}`);
  },
};

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key, {
  auth: { storage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
}) : null;

export function getSupabase() {
  if (!supabase) throw new Error('Sign-in is unavailable. Please configure the Supabase project URL and public key.');
  return supabase;
}
