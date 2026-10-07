import {
  Sen_400Regular,
  Sen_500Medium,
  Sen_600SemiBold,
  Sen_700Bold,
  Sen_800ExtraBold,
} from "@expo-google-fonts/sen";

export const Colors = {
  primary: "#FF7622",

  background: "#FFFFFF",
  surface: "#F6F6F6",
  surfaceSecondary: "#F0F5FA",
  darkBackground: "#121223",

  text: "#32343E",
  textSecondary: "#646982",
  textInverse: "#FFFFFF",

  imagePlaceholder: "#98A8B8",
  border: "#E3EBF2",

  error: "#FF3434",

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export const Fonts = {
  regular: "Sen_400Regular",
  medium: "Sen_500Medium",
  semiBold: "Sen_600SemiBold",
  bold: "Sen_700Bold",
  extraBold: "Sen_800ExtraBold",
} as const;

export const FontAssets = {
  Sen_400Regular,
  Sen_500Medium,
  Sen_600SemiBold,
  Sen_700Bold,
  Sen_800ExtraBold,
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 8,
  medium: 12,
  large: 16,
  round: 999,
} as const;

export type ThemeColor = keyof typeof Colors;