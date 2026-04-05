import { useQuery } from '@tanstack/react-query';
import type {
  GeoFeatureCollection,
  CountryFeature,
  PortFeature,
  CityFeature,
  MaritimeRouteFeature,
} from '@/types/geo';

interface GeoData {
  countries: GeoFeatureCollection<CountryFeature>;
  ports: GeoFeatureCollection<PortFeature>;
  cities: GeoFeatureCollection<CityFeature>;
  routes: GeoFeatureCollection<MaritimeRouteFeature>;
}

async function fetchGeoData(): Promise<GeoData> {
  const base = import.meta.env.BASE_URL;
  const [countries, ports, cities, routes] = await Promise.all([
    fetch(`${base}geodata/countries.geojson`).then(r => r.json()),
    fetch(`${base}geodata/ports.geojson`).then(r => r.json()),
    fetch(`${base}geodata/cities.geojson`).then(r => r.json()),
    fetch(`${base}geodata/maritime-routes.geojson`).then(r => r.json()),
  ]);
  return { countries, ports, cities, routes };
}

export function useGeoData() {
  return useQuery<GeoData>({
    queryKey: ['geodata'],
    queryFn: fetchGeoData,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
