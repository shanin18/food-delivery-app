import { getSupabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

export const OTP_LENGTH = 6;
export const PASSWORD_MIN_LENGTH = 6;
export function normalizeEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Enter a valid email address.");
  return email;
}
export function validatePassword(password: string, confirmation: string) {
  if (password.length < PASSWORD_MIN_LENGTH)
    throw new Error(
      `Use at least ${PASSWORD_MIN_LENGTH} characters for your password.`,
    );
  if (password !== confirmation) throw new Error("Passwords do not match.");
}
export function authRedirectUrl() {
  return Platform.OS === "web"
    ? Linking.createURL("auth-callback")
    : "fooddelivery://auth-callback";
}
let lastCallback: { value: string; result: Promise<boolean> } | null = null;
export function completeAuthUrl(value: string) {
  // The native browser result and Router callback can arrive together.
  if (lastCallback?.value === value) return lastCallback.result;
  const result = consumeAuthUrl(value);
  lastCallback = { value, result };
  return result;
}
async function consumeAuthUrl(value: string) {
  const url = new URL(value);
  const params = new URLSearchParams(url.hash.slice(1));
  url.searchParams.forEach((v, k) => params.set(k, v));
  if (params.get("error"))
    throw new Error(
      params.get("error_description") ?? "Sign-in could not be completed.",
    );
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token)
    throw new Error(
      "This sign-in link is incomplete. Please try signing in again.",
    );
  const { error } = await getSupabase().auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return params.get("type") === "recovery";
}
export async function socialSignIn(provider: "facebook" | "twitter" | "apple") {
  const redirectTo = authRedirectUrl();
  const { data, error } = await getSupabase().auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error("This sign-in provider is unavailable.");
  if (Platform.OS === "web") {
    window.location.assign(data.url);
    return;
  }
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === "success") {
    await completeAuthUrl(result.url);
    return true;
  }
  return false;
}
