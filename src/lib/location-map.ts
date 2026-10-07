export type Coordinates = {
  latitude: number;
  longitude: number;
};

export function locationMapUrl(coordinates: Coordinates | null, zoom = 17) {
  const params = new URLSearchParams({
    layer: "mapnik",
  });

  if (coordinates) {
    const { latitude, longitude } = coordinates;
    const scale = Math.pow(2, 17 - zoom);

    const longitudeDelta = 0.004 * scale;
    const latitudeDelta = 0.003 * scale;

    params.set(
      "bbox",
      [
        Math.max(-180, longitude - longitudeDelta),
        Math.max(-85, latitude - latitudeDelta),
        Math.min(180, longitude + longitudeDelta),
        Math.min(85, latitude + latitudeDelta),
      ].join(","),
    );

    params.set("marker", `${latitude},${longitude}`);
  } else {
    params.set("bbox", "-180,-70,180,80");
  }

  return `https://www.openstreetmap.org/export/embed.html?${params}`;
}
