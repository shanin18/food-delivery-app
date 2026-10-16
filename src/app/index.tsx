import { getRestaurantAccount } from "@/lib/restaurant-account";
import { Colors } from "@/constants/theme";
import { useAuth } from '@/providers/auth-provider';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Animated, Image, StyleSheet, View } from "react-native";

const HomeScreen = () => {
  const { session } = useAuth();
  const [decorationAnimation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const decorationTimer = setTimeout(() => {
      Animated.spring(decorationAnimation, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }).start();
    }, 1000);

    let active = true;
    const navigate = () => {
      if (!session) { router.replace('/onboarding'); return; }
      void getRestaurantAccount().then(account => { if (active) router.replace(account ? '/restaurant/dashboard' : '/home'); }).catch(() => { if (active) router.replace('/home'); });
    };
    navigate();

    return () => {
      clearTimeout(decorationTimer);
      active = false;
    };
  }, [decorationAnimation, session]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} accessibilityLabel="Loading your account" />
      <Animated.Image
        source={require("../../assets/images/splash-decoration.png")}
        resizeMode="contain"
        style={[
          styles.splashDecoration,
          {
            opacity: decorationAnimation,
            transform: [
              {
                translateX: decorationAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
              {
                translateY: decorationAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
              {
                scale: decorationAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },

  logo: {
    width: 120,
    height: 60,
  },

  splashDecoration: {
    position: "absolute",
    bottom: 0,
    right: -20,
    width: 292,
    height: 295,
  },
});

export default HomeScreen;
