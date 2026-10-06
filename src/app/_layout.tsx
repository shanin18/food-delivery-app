import { FontAssets } from "@/constants/theme";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";

const RootLayout = () => {
  const [fontsLoaded] = useFonts(FontAssets);

  if (!fontsLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default RootLayout;