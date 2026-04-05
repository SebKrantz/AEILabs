import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { CONTINENT_PATHS } from "@/data/continents";
import { useGeoData } from "@/hooks/useGeoData";
import { generateGlobeTexture } from "@/utils/generateGlobeTexture";
import type {
  CountryFeature,
  PortFeature,
  CityFeature,
  MaritimeRouteFeature,
  GeoFeatureCollection,
} from "@/types/geo";

const PRIMARY_BLUE = "#4A7FD4";
const ACCENT_AMBER = "#C8912E";

// Trade route arc data: [lat1, lon1, lat2, lon2]
const TRADE_ROUTES: [number, number, number, number][] = [
  [40.7, -74, 51.5, -0.1],
  [51.5, -0.1, 31.2, 121.5],
  [31.2, 121.5, 1.3, 103.8],
  [1.3, 103.8, -33.9, 18.4],
  [34.1, -118.2, 35.7, 139.7],
  [35.7, 139.7, 22.3, 114.2],
  [-23.5, -46.6, 6.5, 3.4],
  [6.5, 3.4, 25, 55],
  [25, 55, 19, 73],
  [19, 73, 31.2, 121.5],
  [55.8, 37.6, 39.9, 116.4],
  [48.9, 2.3, 40.4, -3.7],
  [-33.9, 151.2, 35.7, 139.7],
  [37.6, 127, 35.7, 139.7],
  [52.5, 13.4, 55.8, 37.6],
  [41.9, 12.5, 30, 31.2],
  [30, 31.2, 25, 55],
  [-1.3, 36.8, 25, 55],
  [13.8, 100.5, 1.3, 103.8],
  [49.3, -123.1, 37.6, 127],
];

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createArcPoints(
  start: THREE.Vector3,
  end: THREE.Vector3,
  segments: number,
  altitude: number
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = new THREE.Vector3().lerpVectors(start, end, t);
    const dist = start.distanceTo(end);
    const lift = Math.sin(Math.PI * t) * altitude * (dist / 3);
    point.normalize().multiplyScalar(point.length() + lift);
    points.push(point);
  }
  return points;
}

// ---------------------------------------------------------------------------
// Lights
// ---------------------------------------------------------------------------

function Lights() {
  return (
    <>
      {/* Keeps the night side of the globe faintly visible */}
      <ambientLight intensity={0.15} color="#203060" />
      {/* Primary sun — warm, high intensity, right-front */}
      <directionalLight position={[5, 3, 5]} intensity={1.4} color="#ffe8c0" />
      {/* Cold fill from the opposite side for depth */}
      <directionalLight position={[-4, -2, -3]} intensity={0.25} color="#4060a0" />
      {/* Subtle atmosphere scatter near camera */}
      <pointLight position={[0, 4, 6]} intensity={0.4} color="#3060c0" distance={15} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Globe layers
// ---------------------------------------------------------------------------

function OceanSphere() {
  return (
    <mesh>
      <sphereGeometry args={[2, 64, 64]} />
      <meshPhongMaterial color="#050d1a" shininess={10} specular="#0f2040" />
    </mesh>
  );
}

function LandSphere({ texture }: { texture: THREE.CanvasTexture }) {
  return (
    <mesh>
      <sphereGeometry args={[2.001, 64, 64]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.05}
      />
    </mesh>
  );
}

function AtmosphereGlow() {
  const layers = useMemo(() => {
    const count = 32;
    const minR = 2.01;
    const maxR = 2.55;
    const peakOpacity = 0.08;
    return Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      const r = minR + (maxR - minR) * t;
      const opacity = peakOpacity * Math.exp(-8 * t);
      return { r, opacity };
    });
  }, []);

  return (
    <>
      {layers.map(({ r, opacity }) => (
        <mesh key={r}>
          <sphereGeometry args={[r, 48, 48]} />
          <meshBasicMaterial
            color={PRIMARY_BLUE}
            transparent
            opacity={opacity}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

function WireframeGrid() {
  return (
    <mesh>
      <sphereGeometry args={[2.003, 24, 24]} />
      <meshBasicMaterial
        color={PRIMARY_BLUE}
        wireframe
        transparent
        opacity={0.025}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Country borders (merged LineSegments for one draw call)
// ---------------------------------------------------------------------------

function CountryBorders({ features }: { features: CountryFeature[] }) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const RADIUS = 2.016;

    for (const feature of features) {
      const geom = feature.geometry;
      const polygons =
        geom.type === "Polygon"
          ? [(geom.coordinates as unknown as number[][][])]
          : (geom.coordinates as number[][][][]);

      for (const polygon of polygons) {
        for (const ring of polygon) {
          for (let i = 0; i < ring.length - 1; i++) {
            const [lon1, lat1] = ring[i];
            const [lon2, lat2] = ring[i + 1];
            // Skip segments that cross the antimeridian
            if (Math.abs(lon2 - lon1) > 180) continue;
            const v1 = latLonToVec3(lat1, lon1, RADIUS);
            const v2 = latLonToVec3(lat2, lon2, RADIUS);
            positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
          }
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    return geo;
  }, [features]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#3a7a4a"
        transparent
        opacity={0.6}
        depthTest
        depthWrite={false}
      />
    </lineSegments>
  );
}

// ---------------------------------------------------------------------------
// Maritime routes
// ---------------------------------------------------------------------------

function MaritimeRoutes({ features }: { features: MaritimeRouteFeature[] }) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const RADIUS = 2.012;

    for (const feature of features) {
      const coords = feature.geometry.coordinates;
      for (let i = 0; i < coords.length - 1; i++) {
        const [lon1, lat1] = coords[i];
        const [lon2, lat2] = coords[i + 1];
        if (Math.abs(lon2 - lon1) > 180) continue;
        const v1 = latLonToVec3(lat1, lon1, RADIUS);
        const v2 = latLonToVec3(lat2, lon2, RADIUS);
        positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    return geo;
  }, [features]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#2a6abf"
        transparent
        opacity={0.5}
        depthTest
        depthWrite={false}
      />
    </lineSegments>
  );
}

// ---------------------------------------------------------------------------
// Port markers (InstancedMesh for one draw call)
// ---------------------------------------------------------------------------

function PortMarkers({ features }: { features: PortFeature[] }) {
  const mesh = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.007, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(PRIMARY_BLUE),
      transparent: true,
      opacity: 0.85,
    });
    const iMesh = new THREE.InstancedMesh(geo, mat, features.length);
    const dummy = new THREE.Object3D();

    features.forEach((f, i) => {
      const [lon, lat] = f.geometry.coordinates;
      dummy.position.copy(latLonToVec3(lat, lon, 2.003));
      dummy.updateMatrix();
      iMesh.setMatrixAt(i, dummy.matrix);
    });

    iMesh.instanceMatrix.needsUpdate = true;
    return iMesh;
  }, [features]);

  return <primitive object={mesh} />;
}

// ---------------------------------------------------------------------------
// City markers (InstancedMesh, size by rank_max)
// ---------------------------------------------------------------------------

function CityMarkers({ features }: { features: CityFeature[] }) {
  const mesh = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 6, 6); // unit sphere, scaled per instance
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#f0a030"),
      transparent: true,
      opacity: 0.75,
    });
    const iMesh = new THREE.InstancedMesh(geo, mat, features.length);
    const dummy = new THREE.Object3D();

    features.forEach((f, i) => {
      const [lon, lat] = f.geometry.coordinates;
      const scale = 0.004 + (f.properties.rank_max / 20) * 0.006;
      dummy.position.copy(latLonToVec3(lat, lon, 2.004));
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      iMesh.setMatrixAt(i, dummy.matrix);
    });

    iMesh.instanceMatrix.needsUpdate = true;
    iMesh.renderOrder = 1;
    return iMesh;
  }, [features]);

  return <primitive object={mesh} />;
}

// ---------------------------------------------------------------------------
// Trade arcs (preserved from original)
// ---------------------------------------------------------------------------

function TradeArcs() {
  const arcGeometries = useMemo(() => {
    return TRADE_ROUTES.map(([lat1, lon1, lat2, lon2]) => {
      const start = latLonToVec3(lat1, lon1, 2.01);
      const end = latLonToVec3(lat2, lon2, 2.01);
      const points = createArcPoints(start, end, 50, 0.3);
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.TubeGeometry(curve, 40, 0.005, 4, false);
    });
  }, []);

  return (
    <>
      {arcGeometries.map((geom, i) => (
        <mesh key={i} geometry={geom}>
          <meshBasicMaterial color={PRIMARY_BLUE} transparent opacity={0.35} />
        </mesh>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Flowing particles along trade arcs (preserved from original)
// ---------------------------------------------------------------------------

function FlowingParticles() {
  const particlesRef = useRef<THREE.Points>(null);

  const { geometry, velocities, count } = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    const velocities: number[] = [];

    for (let i = 0; i < count; i++) {
      const routeIdx = Math.floor(Math.random() * TRADE_ROUTES.length);
      const [lat1, lon1, lat2, lon2] = TRADE_ROUTES[routeIdx];
      const t = Math.random();
      const start = latLonToVec3(lat1, lon1, 2.01);
      const end = latLonToVec3(lat2, lon2, 2.01);
      const arcPts = createArcPoints(start, end, 10, 0.3);
      const idx = Math.floor(t * (arcPts.length - 1));
      const point = arcPts[idx];
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      velocities.push(0.3 + Math.random() * 0.7);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry, velocities, count };
  }, []);

  const handleFrame = useCallback(
    ({ clock }: { clock: THREE.Clock }) => {
      if (!particlesRef.current) return;
      const posArray = particlesRef.current.geometry.attributes.position
        .array as Float32Array;
      const time = clock.getElapsedTime();

      for (let i = 0; i < count; i++) {
        const routeIdx = i % TRADE_ROUTES.length;
        const [lat1, lon1, lat2, lon2] = TRADE_ROUTES[routeIdx];
        const start = latLonToVec3(lat1, lon1, 2.01);
        const end = latLonToVec3(lat2, lon2, 2.01);
        const t = ((time * velocities[i] * 0.15 + i / count) % 1 + 1) % 1;
        const arcPts = createArcPoints(start, end, 10, 0.3);
        const segIdx = Math.min(
          Math.floor(t * (arcPts.length - 1)),
          arcPts.length - 2
        );
        const segT = t * (arcPts.length - 1) - segIdx;
        const point = new THREE.Vector3().lerpVectors(
          arcPts[segIdx],
          arcPts[segIdx + 1],
          segT
        );
        posArray[i * 3] = point.x;
        posArray[i * 3 + 1] = point.y;
        posArray[i * 3 + 2] = point.z;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    },
    [count, velocities]
  );

  useFrame(handleFrame);

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        color={PRIMARY_BLUE}
        size={0.022}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Fallback globe — shown while GeoJSON loads
// ---------------------------------------------------------------------------

function FallbackGlobe() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current)
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  const lines = useMemo(() => {
    return CONTINENT_PATHS.map((path) => {
      const points = path.map(([lat, lon]) => latLonToVec3(lat, lon, 2.015));
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(PRIMARY_BLUE),
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      });
      return new THREE.Line(geo, mat);
    });
  }, []);

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial color="#050d1a" shininess={10} specular="#0f2040" />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.15, 64, 64]} />
        <meshBasicMaterial
          color={PRIMARY_BLUE}
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main scene — single rotating group
// ---------------------------------------------------------------------------

interface GlobeSceneProps {
  countries: GeoFeatureCollection<CountryFeature>;
  ports: GeoFeatureCollection<PortFeature>;
  cities: GeoFeatureCollection<CityFeature>;
  routes: GeoFeatureCollection<MaritimeRouteFeature>;
}

function GlobeScene({ countries, ports, cities, routes }: GlobeSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current)
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  const landTexture = useMemo(
    () => generateGlobeTexture(countries),
    [countries]
  );

  return (
    <group ref={groupRef}>
      <OceanSphere />
      <LandSphere texture={landTexture} />
      <AtmosphereGlow />
      <WireframeGrid />
      {/* <CountryBorders features={countries.features} /> */}
      {routes.features.length > 0 && (
        <MaritimeRoutes features={routes.features} />
      )}
      <TradeArcs />
      <FlowingParticles />
      <PortMarkers features={ports.features} />
      <CityMarkers features={cities.features} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Root export
// ---------------------------------------------------------------------------

export default function Globe() {
  const { data } = useGeoData();

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Lights />
        <Stars radius={50} count={3000} factor={4} saturation={0.2} fade />
        {data ? (
          <GlobeScene
            countries={data.countries}
            ports={data.ports}
            cities={data.cities}
            routes={data.routes}
          />
        ) : (
          <FallbackGlobe />
        )}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI * 0.3}
          maxPolarAngle={Math.PI * 0.7}
        />
      </Canvas>
    </div>
  );
}
