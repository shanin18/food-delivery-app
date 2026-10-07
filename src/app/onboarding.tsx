import { Colors, Fonts } from "@/constants/theme";
import { useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const onboardingData = [
  {
    id: 1,
    image: require("../../assets/images/onboarding/onboarding-1.png"),
    title: "All your favorites",
    description:
      "Get all your favorite foods in one place. Just place your order and we'll do the rest.",
  },
  {
    id: 2,
    image: require("../../assets/images/onboarding/onboarding-2.png"),
    title: "Discover delicious food",
    description:
      "Explore a wide variety of dishes and find something delicious for every craving.",
  },
  {
    id: 3,
    image: require("../../assets/images/onboarding/onboarding-3.png"),
    title: "Order from chosen chef",
    description:
      "Choose from talented chefs and enjoy freshly prepared meals made just for you.",
  },
  {
    id: 4,
    image: require("../../assets/images/onboarding/onboarding-4.png"),
    title: "Free delivery offers",
    description:
      "Enjoy special delivery offers and get your favorite meals delivered right to your door.",
  },
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = onboardingData[currentIndex];
  const isLastSlide = currentIndex === onboardingData.length - 1;

  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleNextPress = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleNextRelease = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleNext = () => {
    if (!isLastSlide) {
      setCurrentIndex((prev) => prev + 1);
    }
  };
  return (
    <View style={styles.container}>
      <Image source={currentSlide.image} style={styles.image} />

      <Text style={styles.title}>{currentSlide.title}</Text>

      <Text style={styles.description}>{currentSlide.description}</Text>

      <View style={styles.pagination}>
        {onboardingData.map((item, index) => (
          <View
            key={item?.id}
            style={[styles.dot, index === currentIndex && styles.activeDot]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Animated.View
          style={[
            styles.nextButtonWrapper,
            { transform: [{ scale: buttonScale }] },
          ]}
        >
          <Pressable
            style={styles.nextButton}
            onPressIn={handleNextPress}
            onPressOut={handleNextRelease}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? "GET STARTED" : "NEXT"}
            </Text>
          </Pressable>
        </Animated.View>
        {!isLastSlide && (
          <Pressable style={styles.skipButton}>
            {({ pressed }) => (
              <Text
                style={[
                  styles.skipButtonText,
                  pressed && styles.skipButtonTextPressed,
                ]}
              >
                Skip
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 24,
  },

  image: {
    width: 240,
    height: 292,
    resizeMode: "contain",
  },

  title: {
    fontSize: 24,
    fontFamily: Fonts.extraBold,
    textAlign: "center",
    marginBottom: 18,
    color: Colors.text,
  },

  description: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 24,
    textAlign: "center",
    color: Colors.textSecondary,
    marginBottom: 32,
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 70,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "#FFE1CE",
  },

  activeDot: {
    backgroundColor: Colors.primary,
  },

  actions: {
    width: "100%",
    alignItems: "center",
  },

  nextButtonWrapper: {
    width: "100%",
  },

  nextButton: {
    width: "100%",
    padding: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  nextButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.white,
  },

  skipButton: {
    marginTop: 16,
  },

  skipButtonText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textSecondary,
  },

  skipButtonTextPressed: {
    textDecorationLine: "underline",
  },
});

export default OnboardingScreen;
