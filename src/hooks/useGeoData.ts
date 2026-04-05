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
  const [countries, ports, cities, routes] = await Promise.all([
    fetch('/geodata/countries.geojson').then(r => r.json()),
    fetch('/geodata/ports.geojson').then(r => r.json()),
    fetch('/geodata/cities.geojson').then(r => r.json()),
    fetch('/geodata/maritime-routes.geojson').then(r => r.json()),
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
