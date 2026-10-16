import { Colors, Fonts } from "@/constants/theme";
import { sampleCourier } from "@/data/courier";
import { useCourierChat } from "@/hooks/use-courier-chat";
import { usePayment } from "@/providers/payment-provider";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const emojis = [
  "😀",
  "😊",
  "😂",
  "❤️",
  "👍",
  "🙏",
  "👋",
  "🍔",
  "🍕",
  "📍",
  "🚴",
  "✅",
];
export default function CourierMessageScreen() {
  const { order: latestOrder, orders } = usePayment();
  const { conversationId, orderId } = useLocalSearchParams<{
    conversationId?: string;
    orderId?: string;
  }>();
  const order = orderId ? orders.find(value => value.id === orderId) : latestOrder;
  const chat = useCourierChat(order?.id, conversationId);
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const send = async () => {
    const body = text;
    if (await chat.send(body))
      setText((current) => (current === body ? "" : current));
  };
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close messages"
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/order-tracking")
            }
            style={styles.close}
          >
            <Ionicons name="close" size={22} color={Colors.text} />
          </Pressable>
          <View>
            <Text style={styles.name}>{sampleCourier.name}</Text>
            <Text style={styles.notice}>
              {chat.loading
                ? "Connecting?"
                : chat.connected
                  ? "Connected"
                  : "Reconnecting?"}
            </Text>
          </View>
        </View>
        {chat.error && (
          <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
            <Text
              accessibilityRole="alert"
              style={{
                color: Colors.error,
                fontSize: 12,
                lineHeight: 20,
              }}
            >
              {chat.error}
            </Text>
            <Pressable accessibilityRole="button" onPress={chat.retry}>
              <Text
                style={{
                  color: Colors.primary,
                  marginTop: 8,
                }}
              >
                Retry connection
              </Text>
            </Pressable>
          </View>
        )}
        {!chat.loading &&
          chat.conversation &&
          !chat.conversation.courier_id && (
            <Text style={styles.notice2}>
              Waiting for a courier to be assigned. Your messages will be saved.
            </Text>
          )}
        <ScrollView
          ref={scroll}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() =>
            scroll.current?.scrollToEnd({ animated: true })
          }
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
        >
          {chat.loading && <ActivityIndicator color={Colors.primary} />}
          {!chat.loading && !chat.messages.length && (
            <Text style={styles.empty}>
              Start a conversation with your courier.
            </Text>
          )}
          {chat.messages.map((message) => {
            const mine = message.sender_id === chat.userId;
            return (
              <View
                key={message.id}
                style={[
                  styles.message,
                  !mine && {
                    alignSelf: "flex-start",
                    alignItems: "flex-start",
                  },
                ]}
              >
                <Text style={styles.time}>
                  {new Date(message.created_at).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 8,
                  }}
                >
                  {!mine && (
                    <Image
                      source={sampleCourier.image}
                      style={{ width: 30, height: 30, borderRadius: 15 }}
                    />
                  )}
                  <View
                    style={[
                      styles.bubble,
                      !mine && { backgroundColor: Colors.surfaceSecondary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        !mine && { color: Colors.text },
                      ]}
                    >
                      {message.body}
                    </Text>
                  </View>
                </View>
                {mine && <Text style={styles.time}>Sent</Text>}
              </View>
            );
          })}
        </ScrollView>
        {emojiOpen && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingHorizontal: 24,
              paddingVertical: 8,
            }}
          >
            {emojis.map((emoji) => (
              <Pressable
                key={emoji}
                accessibilityRole="button"
                accessibilityLabel={`Insert ${emoji}`}
                onPress={() =>
                  setText((current) => (current + emoji).slice(0, 1000))
                }
                style={{
                  width: "16.66%",
                  paddingVertical: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 25 }}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        )}
        <View style={styles.composer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose emoji"
            accessibilityState={{ expanded: emojiOpen }}
            onPress={() => setEmojiOpen((value) => !value)}
            hitSlop={8}
          >
            <Ionicons
              name={emojiOpen ? "close-circle-outline" : "happy-outline"}
              size={24}
              color={Colors.imagePlaceholder}
            />
          </Pressable>
          <TextInput
            accessibilityLabel="Message courier"
            value={text}
            onChangeText={setText}
            onFocus={() => setEmojiOpen(false)}
            placeholder="Write something"
            placeholderTextColor={Colors.imagePlaceholder}
            style={styles.input}
            multiline
            maxLength={1000}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={!text.trim() || chat.sending || !chat.conversation}
            onPress={() => void send()}
            style={[
              styles.send,
              (!text.trim() || chat.sending || !chat.conversation) && {
                opacity: 0.4,
              },
            ]}
          >
            {chat.sending ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Ionicons
                name="paper-plane-outline"
                size={24}
                color={Colors.primary}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: "row", alignItems: "center", gap: 16, padding: 24 },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontFamily: Fonts.regular, fontSize: 18, color: Colors.text },
  notice: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  notice2: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginBottom: 16,
    paddingHorizontal: 10,
  },

  messages: { padding: 24, flexGrow: 1, gap: 20 },
  empty: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.imagePlaceholder,
    textAlign: "center",
    marginTop: 32,
  },
  message: {
    alignSelf: "flex-end",
    maxWidth: "85%",
    alignItems: "flex-end",
    gap: 8,
  },
  time: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.imagePlaceholder,
  },
  bubble: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16 },
  messageText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.white,
  },
  composer: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 4,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
    maxHeight: 110,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
