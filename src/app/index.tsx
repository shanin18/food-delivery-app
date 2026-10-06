import { Colors } from "@/constants/theme";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

const HomeScreen = () => {
  const decorationAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const decorationTimer = setTimeout(() => {
      Animated.spring(decorationAnimation, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }).start();
    }, 1000);

    const navigationTimer = setTimeout(() => {
      router.replace("/onboarding");
    }, 2500);

    return () => {
      clearTimeout(decorationTimer);
      clearTimeout(navigationTimer);
    };
  }, [decorationAnimation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

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