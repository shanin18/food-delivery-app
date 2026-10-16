import { Colors } from '@/constants/theme';
import { useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

export function FoodPhotoPreview({ uri }: { uri: string }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  return <View style={{ width: 90, height: 90, borderRadius: 14, overflow: 'hidden', backgroundColor: Colors.surfaceSecondary }}>
    <Image source={{ uri }} style={{ width: '100%', height: '100%' }} onLoadStart={() => { setLoading(true); setFailed(false); }} onLoadEnd={() => setLoading(false)} onError={() => { setFailed(true); setLoading(false); }} />
    {loading && <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={Colors.primary} /></View>}
    {failed && <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', padding: 8 }}><Text style={{ color: Colors.error, fontSize: 11, textAlign: 'center' }}>Could not load photo. Remove and try again.</Text></View>}
  </View>;
}
