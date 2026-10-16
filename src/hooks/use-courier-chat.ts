import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export type ChatMessage = { id: string; sender_id: string; body: string; created_at: string };
type Conversation = { id: string; customer_id: string; courier_id: string | null };
export function useCourierChat(orderRef?: string, conversationId?: string) {
  const { session } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const pending = useRef(false);
  const userId = session?.user.id;
  useEffect(() => {
    let active = true;
    const client = supabase;
    let channel: ReturnType<NonNullable<typeof supabase>['channel']> | undefined;
    let appSubscription: ReturnType<typeof AppState.addEventListener> | undefined;
    const init = async () => {
      setLoading(true); setError(null); setMessages([]); setConversation(null); setConnected(false);
      try {
        if (!client || !userId) throw new Error('Sign in to message your courier.');
        if (!orderRef && !conversationId) throw new Error('Place an order before starting a conversation.');
        let query = client.from('courier_conversations').select('id, customer_id, courier_id');
        query = conversationId ? query.eq('id', conversationId) : query.eq('customer_id', userId).eq('order_ref', orderRef!);
        let { data, error: lookupError } = await query.maybeSingle();
        if (lookupError) throw lookupError;
        if (!data && !conversationId) {
          const created = await client.from('courier_conversations').insert({ customer_id: userId, order_ref: orderRef }).select('id, customer_id, courier_id').single();
          if (created.error?.code === '23505') {
            const existing = await client.from('courier_conversations').select('id, customer_id, courier_id').eq('customer_id', userId).eq('order_ref', orderRef!).single();
            if (existing.error) throw existing.error;
            data = existing.data;
          } else { if (created.error) throw created.error; data = created.data; }
        }
        if (!data) throw new Error('Conversation unavailable for this account.');
        if (!active) return;
        const current = data as Conversation;
        setConversation(current);
        const loadMessages = async () => {
          const result = await client.from('courier_messages').select('id, sender_id, body, created_at').eq('conversation_id', current.id).order('created_at', { ascending: false }).limit(200);
          if (!active) return;
          if (result.error) { setError('Unable to load messages. Please retry.'); return; }
          setMessages(previous => {
            const merged = new Map(previous.map(message => [message.id, message]));
            for (const message of result.data) merged.set(message.id, message);
            return [...merged.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
          });
        };
        channel = client.channel(`courier-chat-${current.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'courier_messages', filter: `conversation_id=eq.${current.id}` }, payload => {
          if (!active) return;
          const message = payload.new as ChatMessage;
          setMessages(previous => previous.some(value => value.id === message.id) ? previous : [...previous, message].sort((a, b) => a.created_at.localeCompare(b.created_at)));
        }).subscribe(status => {
          if (!active) return;
          setConnected(status === 'SUBSCRIBED');
          if (status === 'SUBSCRIBED') void loadMessages();
        });
        appSubscription = AppState.addEventListener('change', state => { if (state === 'active') void loadMessages(); });
        await loadMessages();
      } catch (cause) {
        if (active) {
          const code = (cause as { code?: string })?.code;
          setError(code === 'PGRST205' || code === '42P01' ? 'Messaging setup is required. Apply the courier chat database migration.' : cause instanceof Error ? cause.message : 'Unable to connect to messaging. Please retry.');
        }
      } finally { if (active) setLoading(false); }
    };
    void init();
    return () => { active = false; appSubscription?.remove(); if (channel && client) void client.removeChannel(channel); };
  }, [userId, orderRef, conversationId, attempt]);
  const send = async (body: string) => {
    if (pending.current || !body.trim()) return false;
    if (!conversation || !supabase || !userId) { setError('Messaging is not connected. Please retry.'); return false; }
    pending.current = true; setSending(true); setError(null);
    try {
      const { data, error: insertError } = await supabase.from('courier_messages').insert({ conversation_id: conversation.id, sender_id: userId, body: body.trim().slice(0, 1000) }).select('id, sender_id, body, created_at').single();
      if (insertError) throw insertError;
      setMessages(previous => previous.some(value => value.id === data.id) ? previous : [...previous, data].sort((a, b) => a.created_at.localeCompare(b.created_at)));
      return true;
    } catch { setError('Message was not sent. Check your connection and try again.'); return false; }
    finally { pending.current = false; setSending(false); }
  };
  return { messages, userId, conversation, loading, sending, connected, error, send, retry: () => setAttempt(value => value + 1) };
}
