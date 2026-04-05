import * as THREE from 'three';
import type { GeoFeatureCollection, CountryFeature } from '@/types/geo';

const LAND_COLOR = '#292b2e'; // '#1c1d1f'
const LAND_STROKE_COLOR = '#3d6b3f';

export function generateGlobeTexture(
  countries: GeoFeatureCollection<CountryFeature>,
  resolution: 4096 | 2048 = 4096
): THREE.CanvasTexture {
  const W = resolution;
  const H = resolution / 2;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Transparent background — the ocean sphere shows through
  ctx.clearRect(0, 0, W, H);

  function project(lon: number, lat: number): [number, number] {
    return [
      ((lon + 180) / 360) * W,
      ((90 - lat) / 180) * H,
    ];
  }

  function drawRing(ring: number[][], fill: boolean) {
    // Detect antimeridian crossings (lon jumps > 180 degrees)
    let hasCrossing = false;
    for (let i = 0; i < ring.length - 1; i++) {
      if (Math.abs(ring[i + 1][0] - ring[i][0]) > 180) {
        hasCrossing = true;
        break;
      }
    }

    if (!hasCrossing) {
      ctx.beginPath();
      ring.forEach(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      if (fill) ctx.fill();
      ctx.stroke();
      return;
    }

    // Antimeridian crossing: split into separate paths
    let currentPath: number[][] = [];
    const paths: number[][][] = [currentPath];

    for (let i = 0; i < ring.length - 1; i++) {
      const [lon1, lat1] = ring[i];
      const [lon2] = ring[i + 1];
      currentPath.push([lon1, lat1]);
      if (Math.abs(lon2 - lon1) > 180) {
        currentPath = [];
        paths.push(currentPath);
      }
    }
    // Add the last point
    const last = ring[ring.length - 1];
    if (last) currentPath.push(last);

    for (const path of paths) {
      if (path.length < 2) continue;
      ctx.beginPath();
      path.forEach(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      if (fill) ctx.fill();
      ctx.stroke();
    }
  }

  ctx.strokeStyle = LAND_STROKE_COLOR;
  ctx.lineWidth = 0.5;

  for (const feature of countries.features) {
    const { type, coordinates } = feature.geometry as {
      type: string;
      coordinates: number[][][][];
    };
    const polygons =
      type === 'Polygon'
        ? [(coordinates as unknown as number[][][])]
        : (coordinates as number[][][][]);

    for (const polygon of polygons) {
      for (let r = 0; r < polygon.length; r++) {
        if (r === 0) {
          // Exterior ring: fill with land color
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = LAND_COLOR;
          drawRing(polygon[r], true);
        } else {
          // Interior ring (hole): punch through to transparent
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = 'rgba(0,0,0,1)';
          drawRing(polygon[r], true);
          ctx.globalCompositeOperation = 'source-over';
        }
      }
    }
  }

  ctx.globalCompositeOperation = 'source-over';

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
