import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { AppState, Platform } from "react-native";

const AuthContext = createContext<{
  session: Session | null;
  loading: boolean;
  error: string | null;
}>({ session: null, loading: true, error: null });

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!supabase);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      return;
    }
    let active = true;
    let authChanged = false;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, next) => {
      authChanged = true;
      if (active) {
        setSession(next);
        setLoading(false);
        setError(null);
      }
    });
    client.auth
      .getSession()
      .then(({ data, error: authError }) => {
        if (active && !authChanged) {
          setSession(data.session);
          setError(authError?.message ?? null);
        }
      })
      .catch(() => {
        if (active)
          setError("Could not restore your session. Please sign in again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    if (Platform.OS !== "web" && AppState.currentState === "active")
      client.auth.startAutoRefresh();
    const appState = AppState.addEventListener("change", (state) => {
      if (Platform.OS !== "web") {
        if (state === "active") client.auth.startAutoRefresh();
        else client.auth.stopAutoRefresh();
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
      appState.remove();
      client.auth.stopAutoRefresh();
    };
  }, []);
  return (
    <AuthContext.Provider value={{ session, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
