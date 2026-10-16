import { addressMapHtml } from '@/lib/address-map';
import { validCoordinates } from '@/lib/addresses';
import { useMemo } from 'react';
import { WebView } from 'react-native-webview';
import type { Coordinates } from '@/lib/location-map';
export default function AddressMap({ initial, currentLocation, topInset = 0, onSelect }: { initial?: Coordinates; currentLocation?: Coordinates; topInset?: number; onSelect: (point: Coordinates) => void }) {
  const source = useMemo(() => ({ html: addressMapHtml(initial, currentLocation, topInset), baseUrl: 'https://www.openstreetmap.org/' }), [initial, currentLocation, topInset]);
  return <WebView nestedScrollEnabled source={source} style={{ flex: 1 }} originWhitelist={['https://*', 'about:*']} geolocationEnabled={false} onShouldStartLoadWithRequest={({ url }) => url === 'about:blank' || url === 'https://www.openstreetmap.org/'} onMessage={event => { try { const value = JSON.parse(event.nativeEvent.data); if (value.type === 'address-point' && validCoordinates(value)) onSelect({ latitude: value.latitude, longitude: value.longitude }); } catch { /* Ignore unrelated map messages. */ } }} />;
}
