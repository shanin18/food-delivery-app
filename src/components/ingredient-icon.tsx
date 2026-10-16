import Svg, { Path } from 'react-native-svg';

// Shared outlines keep ingredient symbols consistent in the editor and details.
const outlines: Record<string, string> = {
  salt: 'M9 8h6l2 12H7L9 8Zm0 0V5h6v3M10 5V3h4v2M10 12h.01M14 14h.01M11 17h.01',
  chicken: 'M11 5c4-4 10 1 7 5l-5 5c-1 1-3 1-4 0l-4 4a2 2 0 1 1-3-3l4-4c-1-2 0-4 1-5l4-2Z',
  onion: 'M12 3c-1 4-7 6-7 11a7 7 0 0 0 14 0c0-5-6-7-7-11Zm0 4c-5 5-5 10 0 14m0-14c5 5 5 10 0 14M12 8v13M10 2l2 2 2-2',
  garlic: 'M10 3h4l-1 5c4 1 7 4 6 8-1 4-5 5-7 4-2 1-6 0-7-4-1-4 2-7 6-8l-1-5Zm2 6c-3 4-4 8 0 11m0-11c3 4 4 8 0 11M12 10v10',
  peppers: 'M15 7c-1-3 0-4 3-5M15 7c5 0 6 5 2 9-4 4-10 5-14 5 5-2 6-5 7-10 1-3 2-4 5-4Zm-4 3 5 1',
  ginger: 'm9 9-3-3c-2-2-5 1-3 3l3 3-2 4c-1 3 2 5 4 3l3-3 3 4c2 2 5 0 4-2l-2-4 4-3c2-2 0-5-2-4l-4 2-1-5c0-3-4-3-4 0v5ZM6 13l3 2m4-5 2 3',
  avocado: 'M12 3C9 3 9 7 6 11c-5 7-1 10 6 10s11-3 6-10c-3-4-3-8-6-8Zm0 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  apple: 'M12 7C3 3 2 11 5 17c2 5 4 4 7 3 3 1 5 2 7-3 3-6 2-14-7-10Zm0 0V4m0 0c1-3 4-3 6-2-1 3-3 4-6 2',
  blueberry: 'M8 9a5 5 0 1 0 3 9m5-9a5 5 0 1 1-3 9M12 11a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 4c-1-3-4-3-6-2 1 3 3 4 6 2Zm0 0c1-3 4-3 6-2-1 3-3 4-6 2M12 4v7m-2 4 2 1 2-1',
  broccoli: 'M8 13c-5 1-7-5-3-7-1-4 5-6 7-3 3-3 8-1 7 3 4 2 2 8-3 7M8 12l3 5v4h4v-4l2-5m-5 5-1-6m4 6 1-6',
  orange: 'M12 7a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM12 7V4m0 1c1-4 5-4 7-3-1 3-4 4-7 3M7 13c0-1 1-3 3-3',
  walnut: 'M12 3c-3-2-6 1-6 4-4 2-3 6-1 8-1 4 3 7 7 5 4 2 8-1 7-5 2-2 3-6-1-8 0-3-3-6-6-4ZM12 4v15M8 7l1 4-2 3 2 3m7-10-1 4 2 3-2 3',
};

export function IngredientIcon({ ingredient, size = 22, color }: { ingredient: string; size?: number; color: string }) {
  const name = ingredient.toLowerCase().trim();
  const key = Object.keys(outlines).find(value => name.includes(value));
  return <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
    <Path d={outlines[key ?? ''] ?? 'M12 21V10M12 15C3 15 3 6 3 6s9 0 9 9Zm0-4c0-8 9-8 9-8s0 8-9 8Z'} stroke={color} strokeWidth={1.35} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>;
}
