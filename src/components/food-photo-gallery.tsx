import { Colors } from '@/constants/theme';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View, type ImageSourcePropType } from 'react-native';

export function FoodPhotoGallery({ photos, fallback, name }: { photos: string[]; fallback: ImageSourcePropType; name: string }) {
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);
  const images: ImageSourcePropType[] = photos.length ? photos.map(uri => ({ uri })) : [fallback];
  return <View style={styles.gallery} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    {width > 0 && <ScrollView key={width} horizontal pagingEnabled directionalLockEnabled showsHorizontalScrollIndicator={false}
      onScroll={event => setActive(Math.round(event.nativeEvent.contentOffset.x / width))} scrollEventThrottle={32}
      accessibilityLabel={`${name} photo gallery`}>
      {images.map((source, index) => <Image key={index} source={source} accessibilityLabel={`${name}, photo ${index + 1} of ${images.length}`} style={{ width, height: width * 3 / 4 }} resizeMode={photos.length ? "cover" : "contain"} />)}
    </ScrollView>}
    {images.length > 1 && <View pointerEvents="none" style={styles.pagination}>
      {images.map((_, index) => <View key={index} style={[styles.dot, index === active && styles.active]} />)}
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  gallery: { aspectRatio: 4 / 3, borderRadius: 20, overflow: 'hidden' },
  pagination: { position: 'absolute', bottom: 18, alignSelf: 'center', flexDirection: 'row', gap: 6, backgroundColor: 'rgba(18,18,35,0.4)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  active: { width: 16, backgroundColor: Colors.primary },
});
