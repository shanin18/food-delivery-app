import { Colors, Fonts } from "@/constants/theme";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isLastSlide = currentIndex === onboardingData.length - 1;

  const [buttonScale] = useState(() => new Animated.Value(1));
  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleNext = () => {
    if (isLastSlide) {
      router.replace("/login");
      return;
    }

    flatListRef.current?.scrollToIndex({
      index: currentIndex + 1,
      animated: true,
    });
  };
  
  const handleSkip = () => {
    router.replace("/login");
  };

  // Runs when the user finishes swiping.
  // We calculate which page is currently visible.
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);

    setCurrentIndex(newIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />

            <Text style={styles.title}>{item.title}</Text>

            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {onboardingData.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.dot,

              // Only the currently visible page gets the orange dot.
              index === currentIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Bottom buttons */}
      <View style={styles.actions}>
        {/* 
          Animated.View handles the smooth scale animation.
          Pressable handles the actual touch interaction.
        */}
        <Animated.View
          style={[
            styles.nextButtonWrapper,
            {
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <Pressable
            style={styles.nextButton}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? "GET STARTED" : "NEXT"}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Don't show Skip on the last onboarding page */}
        {!isLastSlide && (
          <Pressable style={styles.skipButton} onPress={handleSkip}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // One complete onboarding page.
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  image: {
    width: 240,
    height: 292,
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
  },

  // Pagination container.
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
    borderRadius: 5,
    backgroundColor: "#FFE1CE",
  },

  activeDot: {
    backgroundColor: Colors.primary,
  },

  actions: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 30,
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
