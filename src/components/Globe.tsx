import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Trade route arc data: [lat1, lon1, lat2, lon2]
const TRADE_ROUTES: [number, number, number, number][] = [
  [40.7, -74, 51.5, -0.1],    // NYC -> London
  [51.5, -0.1, 31.2, 121.5],  // London -> Shanghai
  [31.2, 121.5, 1.3, 103.8],  // Shanghai -> Singapore
  [1.3, 103.8, -33.9, 18.4],  // Singapore -> Cape Town
  [34.1, -118.2, 35.7, 139.7],// LA -> Tokyo
  [35.7, 139.7, 22.3, 114.2], // Tokyo -> Hong Kong
  [-23.5, -46.6, 6.5, 3.4],   // Sao Paulo -> Lagos
  [6.5, 3.4, 25, 55],         // Lagos -> Dubai
  [25, 55, 19, 73],           // Dubai -> Mumbai
  [19, 73, 31.2, 121.5],      // Mumbai -> Shanghai
  [55.8, 37.6, 39.9, 116.4],  // Moscow -> Beijing
  [48.9, 2.3, 40.4, -3.7],    // Paris -> Madrid
  [-33.9, 151.2, 35.7, 139.7],// Sydney -> Tokyo
  [37.6, 127, 35.7, 139.7],   // Seoul -> Tokyo
  [52.5, 13.4, 55.8, 37.6],   // Berlin -> Moscow
  [41.9, 12.5, 30, 31.2],     // Rome -> Cairo
  [30, 31.2, 25, 55],         // Cairo -> Dubai
  [-1.3, 36.8, 25, 55],       // Nairobi -> Dubai
  [13.8, 100.5, 1.3, 103.8],  // Bangkok -> Singapore
  [49.3, -123.1, 37.6, 127],  // Vancouver -> Seoul
];

// Major economic nodes: [lat, lon, importance]
const ECONOMIC_NODES: [number, number, number][] = [
  [40.7, -74, 1],     // NYC
  [51.5, -0.1, 0.9],  // London
  [31.2, 121.5, 1],   // Shanghai
  [35.7, 139.7, 0.85],// Tokyo
  [1.3, 103.8, 0.8],  // Singapore
  [25, 55, 0.7],      // Dubai
  [22.3, 114.2, 0.85],// Hong Kong
  [19, 73, 0.75],     // Mumbai
  [-23.5, -46.6, 0.65],// Sao Paulo
  [34.1, -118.2, 0.8],// LA
  [48.9, 2.3, 0.7],   // Paris
  [55.8, 37.6, 0.6],  // Moscow
  [39.9, 116.4, 0.9], // Beijing
  [37.6, 127, 0.75],  // Seoul
  [-33.9, 151.2, 0.6],// Sydney
  [6.5, 3.4, 0.5],    // Lagos
  [-33.9, 18.4, 0.45],// Cape Town
  [30, 31.2, 0.5],    // Cairo
  [52.5, 13.4, 0.65], // Berlin
  [41.9, 12.5, 0.55], // Rome
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

function createArcPoints(start: THREE.Vector3, end: THREE.Vector3, segments: number, altitude: number): THREE.Vector3[] {
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

function GlobeCore() {
  const globeRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group>
      {/* Globe sphere */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#0a1628"
          roughness={0.8}
          metalness={0.2}
          transparent
          opacity={0.95}
        />
        {/* Wireframe overlay for "grid" feel */}
        <mesh>
          <sphereGeometry args={[2.005, 36, 36]} />
          <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.06} />
        </mesh>
      </mesh>
      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.15, 64, 64]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function TradeArcs() {
  const arcsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (arcsRef.current) {
      arcsRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  const arcGeometries = useMemo(() => {
    return TRADE_ROUTES.map(([lat1, lon1, lat2, lon2]) => {
      const start = latLonToVec3(lat1, lon1, 2.01);
      const end = latLonToVec3(lat2, lon2, 2.01);
      const points = createArcPoints(start, end, 50, 0.3);
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.TubeGeometry(curve, 40, 0.006, 4, false);
    });
  }, []);

  return (
    <group ref={arcsRef}>
      {arcGeometries.map((geom, i) => (
        <mesh key={i} geometry={geom}>
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function FlowingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { positions, velocities, count } = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    const velocities: number[] = [];
    
    for (let i = 0; i < count; i++) {
      const routeIdx = Math.floor(Math.random() * TRADE_ROUTES.length);
      const [lat1, lon1, lat2, lon2] = TRADE_ROUTES[routeIdx];
      const t = Math.random();
      const start = latLonToVec3(lat1, lon1, 2.01);
      const end = latLonToVec3(lat2, lon2, 2.01);
      const points = createArcPoints(start, end, 10, 0.3);
      const idx = Math.floor(t * (points.length - 1));
      const point = points[idx];
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      velocities.push(0.3 + Math.random() * 0.7);
    }
    return { positions, velocities, count };
  }, []);

  const handleFrame = useCallback(({ clock }: { clock: THREE.Clock }) => {
    if (!particlesRef.current) return;
    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const time = clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
      const routeIdx = i % TRADE_ROUTES.length;
      const [lat1, lon1, lat2, lon2] = TRADE_ROUTES[routeIdx];
      const start = latLonToVec3(lat1, lon1, 2.01);
      const end = latLonToVec3(lat2, lon2, 2.01);
      const t = ((time * velocities[i] * 0.15) + (i / count)) % 1;
      const points = createArcPoints(start, end, 10, 0.3);
      const segIdx = Math.min(Math.floor(t * (points.length - 1)), points.length - 2);
      const segT = (t * (points.length - 1)) - segIdx;
      const point = new THREE.Vector3().lerpVectors(points[segIdx], points[segIdx + 1], segT);
      posArray[i * 3] = point.x;
      posArray[i * 3 + 1] = point.y;
      posArray[i * 3 + 2] = point.z;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.05;
    }
  }, [count, velocities]);

  useFrame(handleFrame);

  return (
    <group ref={groupRef}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={count}
          />
        </bufferGeometry>
        <pointsMaterial color="#00d4ff" size={0.025} transparent opacity={0.8} sizeAttenuation />
      </points>
    </group>
  );
}

function EconomicNodes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  const nodes = useMemo(() => {
    return ECONOMIC_NODES.map(([lat, lon, importance]) => ({
      position: latLonToVec3(lat, lon, 2.02),
      scale: importance,
    }));
  }, []);

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[0.02 * node.scale, 8, 8]} />
          <meshBasicMaterial color="#ffb800" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Stars() {
  const starPositions = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return positions;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[starPositions, 3]} count={2000} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.05} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function Globe() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={0.8} color="#e0f0ff" />
        <pointLight position={[-5, -3, -5]} intensity={0.3} color="#00d4ff" />
        <Stars />
        <GlobeCore />
        <TradeArcs />
        <FlowingParticles />
        <EconomicNodes />
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
