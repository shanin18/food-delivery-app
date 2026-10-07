import { locationMapUrl, type Coordinates } from '@/lib/location-map';

export default function LocationMap({ coordinates }: { coordinates: Coordinates | null }) {
  return <iframe
    title={coordinates ? 'Your detected location on OpenStreetMap' : 'OpenStreetMap preview'}
    src={locationMapUrl(coordinates)}
    style={{ width: '100%', height: '100%', border: 0 }}
    referrerPolicy="no-referrer"
  />;
}
