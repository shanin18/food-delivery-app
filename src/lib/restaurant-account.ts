import { getSupabase } from '@/lib/supabase';
export async function getRestaurantAccount() {
  const client = getSupabase();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  const result = await client.from('restaurant_accounts').select('restaurant_name, location').eq('user_id', user.id).maybeSingle();
  if (result.error) throw new Error('Restaurant access is unavailable. Apply the restaurant accounts migration and try again.');
  return result.data as { restaurant_name: string; location: string } | null;
}
