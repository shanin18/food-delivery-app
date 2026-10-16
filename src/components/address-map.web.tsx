import { addressMapHtml } from '@/lib/address-map';
import { validCoordinates } from '@/lib/addresses';
import type { Coordinates } from '@/lib/location-map';
import { useEffect, useMemo, useRef } from 'react';
export default function AddressMap({ initial, currentLocation, topInset = 0, onSelect }: { initial?: Coordinates; currentLocation?: Coordinates; topInset?: number; onSelect: (point: Coordinates) => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const html = useMemo(() => addressMapHtml(initial, currentLocation, topInset), [initial, currentLocation, topInset]);
  useEffect(() => { const receive = (event: MessageEvent) => { if (event.source !== frame.current?.contentWindow || typeof event.data !== 'string') return; try { const value = JSON.parse(event.data); if (value.type === 'address-point' && validCoordinates(value)) onSelect(value); } catch { /* Ignore unrelated messages. */ } }; window.addEventListener('message', receive); return () => window.removeEventListener('message', receive); }, [onSelect]);
  return <iframe ref={frame} title="Choose delivery location" srcDoc={html} sandbox="allow-scripts" style={{ width: '100%', height: '100%', border: 0 }} />;
}
