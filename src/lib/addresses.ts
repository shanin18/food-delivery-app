export type SavedAddress = { id: string; label: 'Home' | 'Work' | 'Other'; address: string; street: string; postcode: string; apartment: string; latitude: number; longitude: number };
export function formatAddress(value: SavedAddress) {
  return [value.apartment ? `Apt ${value.apartment}` : '', value.address].filter(Boolean).join(', ').slice(0, 300);
}
export function validCoordinates(value: unknown): value is { latitude: number; longitude: number } {
  const point = value as { latitude?: number; longitude?: number } | null;
  return !!point && typeof point.latitude === 'number' && typeof point.longitude === 'number' && Number.isFinite(point.latitude) && Number.isFinite(point.longitude) && Math.abs(point.latitude) <= 85 && Math.abs(point.longitude) <= 180;
}
export function parseGeocodedAddress(data: { display_name?: string; address?: Record<string, string> }) {
  const parts = data.address ?? {};
  return { address: data.display_name ?? '', street: [parts.house_number, parts.road ?? parts.pedestrian ?? parts.residential ?? parts.neighbourhood].filter(Boolean).join(' '), postcode: parts.postcode ?? '' };
}
