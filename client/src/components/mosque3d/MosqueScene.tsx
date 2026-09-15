/**
 * MosqueScene.tsx
 * ───────────────
 * The persistent WebGL canvas that lives behind the entire Home page.
 * It renders ONE continuous mosque environment throughout all scroll sections.
 *
 * Architecture:
 *   <Canvas fixed/sticky> → lighting + mosque + environment + particles
 *   Scroll position is injected via `scrollProgress` prop (0–1).
 *   CameraController interpolates along a pre-defined keyframe path.
 */

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Fog } from '@react-three/drei';
import * as THREE from 'three';
import MosqueGeometry from './MosqueGeometry';

// ── Camera keyframes (position + target, scroll 0-1) ─────────────────────────
const CAM_KEYFRAMES = [
  // 0%  — wide cinematic view
  { t: 0.00, pos: [0, 10, 32],  look: [0, 3, 0] },
  // 15% — slow approach
  { t: 0.12, pos: [6, 8, 26],   look: [0, 4, 0] },
  // 30% — 45-degree, reveal dome & minarets
  { t: 0.25, pos: [12, 9, 20],  look: [0, 4, 0] },
  // 45% — toward entrance, arches + warm light
  { t: 0.38, pos: [4, 5, 18],   look: [0, 3, 0] },
  // 60% — around toward courtyard
  { t: 0.52, pos: [-10, 6, 16], look: [0, 4, 0] },
  // 75% — elevated angle, dome & courtyard overview
  { t: 0.65, pos: [-8, 14, 10], look: [0, 4, 0] },
  // 90% — side elevation
  { t: 0.82, pos: [14, 11, -6], look: [0, 4, 0] },
  // 100% — pull back elevated cinematic
  { t: 1.00, pos: [0, 18, 28],  look: [0, 3, 0] },
] as const;

// Cubic-bezier easing helper
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Interpolate between two keyframes
function lerpKeyframe(
  a: (typeof CAM_KEYFRAMES)[number],
  b: (typeof CAM_KEYFRAMES)[number],
  rawT: number
) {
  const span = b.t - a.t;
  const local = span === 0 ? 0 : (rawT - a.t) / span;
  const t = easeInOutCubic(Math.max(0, Math.min(1, local)));
  const pos = new THREE.Vector3(
    a.pos[0] + (b.pos[0] - a.pos[0]) * t,
    a.pos[1] + (b.pos[1] - a.pos[1]) * t,
    a.pos[2] + (b.pos[2] - a.pos[2]) * t
  );
  const look = new THREE.Vector3(
    a.look[0] + (b.look[0] - a.look[0]) * t,
    a.look[1] + (b.look[1] - a.look[1]) * t,
    a.look[2] + (b.look[2] - a.look[2]) * t
  );
  return { pos, look };
}

// ── Camera Controller ─────────────────────────────────────────────────────────
function CameraController({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 10, 32));
  const currentLook = useRef(new THREE.Vector3(0, 3, 0));
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useFrame(() => {
    const progress = scrollProgress.current;
    const kf = CAM_KEYFRAMES as unknown as Array<{
      t: number;
      pos: [number, number, number];
      look: [number, number, number];
    }>;

    // Find surrounding keyframes
    let aIdx = 0;
    for (let i = 0; i < kf.length - 1; i++) {
      if (progress >= kf[i].t && progress <= kf[i + 1].t) {
        aIdx = i;
        break;
      }
    }
    const a = kf[aIdx];
    const b = kf[Math.min(aIdx + 1, kf.length - 1)];

    const { pos, look } = lerpKeyframe(a as any, b as any, progress);

    // Smooth lerp toward target (cinematic feel)
    const lerpSpeed = reducedMotion.current ? 1 : 0.045;
    currentPos.current.lerp(pos, lerpSpeed);
    currentLook.current.lerp(look, lerpSpeed);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLook.current);
  });

  return null;
}

// ── Environment Lighting ──────────────────────────────────────────────────────
function SceneLighting({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const moonRef = useRef<THREE.DirectionalLight>(null);
  const warmRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const p = scrollProgress.current;
    // As scroll progresses the warm dome light intensifies slightly
    if (warmRef.current) {
      warmRef.current.intensity = 3.5 + p * 2.5;
    }
    // Moonlight stays subtle
    if (moonRef.current) {
      moonRef.current.intensity = 0.5 + (1 - p) * 0.2;
    }
  });

  return (
    <>
      {/* Ambient — deep emerald tint */}
      <ambientLight color={new THREE.Color('#0d2416')} intensity={1.2} />

      {/* Moonlight — cool blueish directional */}
      <directionalLight
        ref={moonRef}
        color={new THREE.Color('#c8d8f0')}
        intensity={0.65}
        position={[-15, 22, -10]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Warm golden dome fill light */}
      <pointLight
        ref={warmRef}
        color={new THREE.Color('#f4a83a')}
        intensity={3.5}
        distance={25}
        decay={2}
        position={[0, 9, 0]}
      />

      {/* Emerald courtyard fill */}
      <pointLight
        color={new THREE.Color('#1a6b3a')}
        intensity={4}
        distance={30}
        decay={2}
        position={[0, 3, 6]}
      />

      {/* Back rim light */}
      <pointLight
        color={new THREE.Color('#0d3020')}
        intensity={2}
        distance={20}
        decay={2}
        position={[0, 8, -12]}
      />

      {/* Side warm fill */}
      <pointLight
        color={new THREE.Color('#c8921a')}
        intensity={1.5}
        distance={18}
        decay={2}
        position={[10, 5, 5]}
      />
    </>
  );
}

// ── Floating Dust Particles ───────────────────────────────────────────────────
function DustParticles() {
  const count = 180;
  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sp = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = Math.random() * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 28;
      sp[i] = 0.003 + Math.random() * 0.008;
    }
    return { positions: pos, speeds: sp };
  }, []);

  const geoRef = useRef<THREE.BufferGeometry>(null);
  useFrame(({ clock }) => {
    if (!geoRef.current) return;
    const pos = geoRef.current.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i];
      if (pos[i * 3 + 1] > 14) pos[i * 3 + 1] = 0;
      pos[i * 3] += Math.sin(clock.elapsedTime * 0.3 + i) * 0.003;
    }
    geoRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#f4c060"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </points>
  );
}

// ── Fog plane to give atmospheric depth ──────────────────────────────────────
function AtmosphericFog() {
  return (
    <>
      {/* Ground mist */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshBasicMaterial
          color="#0d2416"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

// ── WebGL availability check ──────────────────────────────────────────────────
function checkWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// ── Main Scene Component ──────────────────────────────────────────────────────
interface MosqueSceneProps {
  scrollProgress: React.MutableRefObject<number>;
  webglAvailable?: boolean;
}

function SceneContents({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  return (
    <>
      {/* Three.js scene fog */}
      <fog attach="fog" args={['#040d06', 28, 75]} />

      {/* Lighting */}
      <SceneLighting scrollProgress={scrollProgress} />

      {/* Stars */}
      <Stars
        radius={80}
        depth={50}
        count={2500}
        factor={3}
        saturation={0.3}
        fade
        speed={0.4}
      />

      {/* Atmospheric effects */}
      <AtmosphericFog />
      <DustParticles />

      {/* The mosque */}
      <MosqueGeometry />

      {/* Camera */}
      <CameraController scrollProgress={scrollProgress} />
    </>
  );
}

export default function MosqueScene({ scrollProgress, webglAvailable = true }: MosqueSceneProps) {
  if (!webglAvailable) return null;

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 55, near: 0.5, far: 120, position: [0, 10, 32] }}
      style={{ background: '#040d06' }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    >
      <SceneContents scrollProgress={scrollProgress} />
    </Canvas>
  );
}
