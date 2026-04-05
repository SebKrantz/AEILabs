export interface CountryFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][][] | number[][][];
  };
  properties: { NAME: string; ADM0_A3: string; SOVEREIGNT: string };
}

export interface PortFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: { name: string; scalerank: number };
}

export interface CityFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: { name: string; adm0name: string; pop_max: number; rank_max: number };
}

export interface MaritimeRouteFeature {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties: Record<string, never>;
}

export interface GeoFeatureCollection<F> {
  type: 'FeatureCollection';
  features: F[];
}
