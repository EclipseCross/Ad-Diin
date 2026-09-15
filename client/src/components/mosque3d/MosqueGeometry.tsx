/**
 * MosqueGeometry.tsx
 * ──────────────────
 * Procedurally generated 3-D Islamic mosque using React Three Fiber primitives.
 * No external GLB / asset file required.
 *
 * Architectural elements:
 *  • Central large dome (flattened sphere atop a drum)
 *  • Four corner minarets with pointed finials
 *  • Two flanking smaller domes
 *  • Main prayer hall body
 *  • Pointed / horseshoe arched entrance portico
 *  • Surrounding courtyard walls with arched openings
 *  • Stone courtyard floor with subtle grid
 *  • Decorative crenellations
 *  • Arabic arch-window ornaments on facades
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Shared PBR-ish materials ─────────────────────────────────────────────────
function useMaterials() {
  return useMemo(() => {
    const stone = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8b7355'),
      roughness: 0.88,
      metalness: 0.04,
    });

    const stoneDark = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6b5a3e'),
      roughness: 0.92,
      metalness: 0.02,
    });

    const domeGold = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#c8a535'),
      roughness: 0.35,
      metalness: 0.65,
      envMapIntensity: 1.2,
    });

    const marble = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d4c9a8'),
      roughness: 0.55,
      metalness: 0.06,
    });

    const courtyard = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#b5a07a'),
      roughness: 0.95,
      metalness: 0.01,
    });

    const archDark = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3d2f1a'),
      roughness: 0.8,
      metalness: 0.05,
      transparent: true,
      opacity: 0.9,
    });

    return {
      stone,
      stoneDark,
      domeGold,
      marble,
      courtyard,
      archDark,
    };
  }, []);
}

// ─── Arch shape (extruded horseshoe) ──────────────────────────────────────────
// This shape is used by the EntranceIwan to create a real 3-D entrance arch.
function createArchShape(
  w: number,
  h: number,
  thickness: number
): THREE.Shape {
  const s = new THREE.Shape();
  const r = w / 2;

  // Outer horseshoe arch
  s.moveTo(-r - thickness, 0);
  s.lineTo(-r - thickness, h * 0.55);

  s.absarc(
    0,
    h * 0.55,
    r + thickness,
    Math.PI,
    0,
    false
  );

  s.lineTo(r + thickness, 0);

  // Inner horseshoe arch
  s.lineTo(r, 0);
  s.lineTo(r, h * 0.55);

  s.absarc(
    0,
    h * 0.55,
    r,
    0,
    Math.PI,
    true
  );

  s.lineTo(-r, 0);
  s.closePath();

  return s;
}

// ─── Minaret component ───────────────────────────────────────────────────────
function Minaret({
  position,
  mat,
}: {
  position: [number, number, number];
  mat: THREE.MeshStandardMaterial;
}) {
  return (
    <group position={position}>
      {/* Base plinth */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[0.9, 0.6, 0.9]} />
        <primitive object={mat} attach="material" />
      </mesh>

      {/* Main shaft */}
      <mesh castShadow receiveShadow position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.32, 0.4, 4, 10]} />
        <primitive object={mat} attach="material" />
      </mesh>

      {/* Balcony ring */}
      <mesh castShadow position={[0, 4.7, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.18, 12]} />
        <primitive object={mat} attach="material" />
      </mesh>

      {/* Upper shaft */}
      <mesh castShadow receiveShadow position={[0, 5.7, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1.8, 10]} />
        <primitive object={mat} attach="material" />
      </mesh>

      {/* Conical finial */}
      <mesh castShadow position={[0, 7.2, 0]}>
        <coneGeometry args={[0.2, 1.1, 10]} />
        <primitive object={mat} attach="material" />
      </mesh>

      {/* Gold tip */}
      <mesh position={[0, 7.85, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// ─── Dome component ──────────────────────────────────────────────────────────
function Dome({
  position,
  radius = 2.5,
  drumH = 0.8,
  mat,
  gold = false,
}: {
  position: [number, number, number];
  radius?: number;
  drumH?: number;
  mat: THREE.MeshStandardMaterial;
  gold?: boolean;
}) {
  const goldMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#c8a535',
        roughness: 0.35,
        metalness: 0.65,
      }),
    []
  );

  return (
    <group position={position}>
      {/* Drum */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry
          args={[
            radius * 0.98,
            radius * 1.0,
            drumH,
            16,
          ]}
        />
        <primitive object={mat} attach="material" />
      </mesh>

      {/* Dome sphere — slightly flattened */}
      <mesh
        castShadow
        receiveShadow
        position={[0, drumH / 2, 0]}
      >
        <sphereGeometry
          args={[
            radius,
            24,
            16,
            0,
            Math.PI * 2,
            0,
            Math.PI * 0.55,
          ]}
        />
        <primitive
          object={gold ? goldMat : mat}
          attach="material"
        />
      </mesh>

      {/* Finial */}
      <mesh
        position={[
          0,
          drumH / 2 + radius * 0.65,
          0,
        ]}
      >
        <coneGeometry args={[0.08, 0.4, 8]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      <mesh
        position={[
          0,
          drumH / 2 + radius * 0.65 + 0.28,
          0,
        ]}
      >
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

// ─── Window arch row on facade ───────────────────────────────────────────────
function WindowRow({
  count = 5,
  y,
  z,
  mat,
}: {
  count?: number;
  y: number;
  z: number;
  mat: THREE.MeshStandardMaterial;
}) {
  const spacing = 2.4;
  const total = (count - 1) * spacing;

  return (
    <group position={[0, y, z]}>
      {Array.from({ length: count }, (_, i) => {
        const x = -total / 2 + i * spacing;

        return (
          <group key={i} position={[x, 0, 0]}>
            {/* Arch outline */}
            <mesh>
              <torusGeometry
                args={[0.5, 0.06, 8, 20, Math.PI]}
              />
              <primitive object={mat} attach="material" />
            </mesh>

            {/* Window sill */}
            <mesh position={[0, -0.55, 0]}>
              <boxGeometry args={[1.1, 0.08, 0.08]} />
              <primitive object={mat} attach="material" />
            </mesh>

            {/* Dark interior */}
            <mesh position={[0, -0.1, 0.01]}>
              <planeGeometry args={[0.85, 1.1]} />
              <meshStandardMaterial
                color="#1a0f08"
                roughness={1}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─── Crenellation row ────────────────────────────────────────────────────────
function Crenellations({
  count,
  length,
  y,
  z,
  rotY = 0,
  mat,
}: {
  count: number;
  length: number;
  y: number;
  z: number;
  rotY?: number;
  mat: THREE.MeshStandardMaterial;
}) {
  const spacing = length / count;

  return (
    <group rotation={[0, rotY, 0]}>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          castShadow
          position={[
            -length / 2 + i * spacing + spacing / 2,
            y,
            z,
          ]}
        >
          <boxGeometry
            args={[spacing * 0.5, 0.45, 0.25]}
          />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Entrance Iwan (real 3-D horseshoe gateway) ──────────────────────────────
function EntranceIwan({
  mat,
  dark,
}: {
  mat: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
}) {
  // The previously unused createArchShape() is now used here
  // to create the actual 3-D horseshoe arch geometry.
  const archGeometry = useMemo(() => {
    const shape = createArchShape(2.4, 3.4, 0.22);

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.65,
      bevelEnabled: false,
      curveSegments: 12,
      steps: 1,
    });
  }, []);

  return (
    <group position={[0, 0, 5.55]}>
      {/* Iwan body */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 2.2, 0]}
      >
        <boxGeometry args={[5.5, 4.4, 0.6]} />
        <primitive object={mat} attach="material" />
      </mesh>

      {/* Real 3-D horseshoe arch */}
      <mesh
        geometry={archGeometry}
        position={[0, 0.05, -0.34]}
        castShadow
        receiveShadow
      >
        <primitive object={dark} attach="material" />
      </mesh>

      {/* Dark inner doorway behind the arch */}
      <mesh
        position={[0, 1.45, -0.35]}
      >
        <planeGeometry args={[2.35, 3.2]} />
        <primitive object={dark} attach="material" />
      </mesh>

      {/* Side pilasters */}
      {[-2.2, 2.2].map((x, i) => (
        <mesh
          key={i}
          castShadow
          position={[x, 2.2, 0]}
        >
          <boxGeometry args={[0.4, 4.4, 0.65]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}

      {/* Muqarnas-suggestion (stepped corbels) */}
      {[-1, 0, 1].map((x, i) => (
        <mesh
          key={i}
          position={[x * 0.6, 3.6, 0.12]}
          castShadow
        >
          <boxGeometry args={[0.35, 0.2, 0.15]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Courtyard wall segment with arch openings ───────────────────────────────
function CourtyardWall({
  length,
  position,
  rotY = 0,
  mat,
}: {
  length: number;
  position: [number, number, number];
  rotY?: number;
  mat: THREE.MeshStandardMaterial;
}) {
  const arches = Math.floor(length / 3);

  return (
    <group
      position={position}
      rotation={[0, rotY, 0]}
    >
      {/* Wall base */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 1.4, 0]}
      >
        <boxGeometry args={[length, 2.8, 0.45]} />
        <primitive object={mat} attach="material" />
      </mesh>

      {/* Arch openings */}
      {Array.from({ length: arches }, (_, i) => {
        const x =
          -length / 2 +
          (i + 0.5) * (length / arches);

        return (
          <mesh
            key={i}
            position={[x, 1.3, 0.01]}
          >
            <planeGeometry args={[1.4, 2.0]} />
            <meshStandardMaterial
              color="#2a1f0e"
              roughness={1}
              transparent
              opacity={0.85}
            />
          </mesh>
        );
      })}

      {/* Crenellations on top */}
      {Array.from(
        { length: Math.floor(length / 0.9) },
        (_, i) => (
          <mesh
            key={i}
            castShadow
            position={[
              -length / 2 + i * 0.9 + 0.45,
              3.1,
              0,
            ]}
          >
            <boxGeometry args={[0.45, 0.4, 0.5]} />
            <primitive object={mat} attach="material" />
          </mesh>
        )
      )}
    </group>
  );
}

// ─── Geometric floor pattern ─────────────────────────────────────────────────
function CourtyardFloor({
  mat,
}: {
  mat: THREE.MeshStandardMaterial;
}) {
  return (
    <group>
      {/* Main courtyard slab */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
      >
        <planeGeometry args={[40, 40, 8, 8]} />
        <primitive object={mat} attach="material" />
      </mesh>

      {/* Central star pattern */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <ringGeometry args={[0, 4, 8]} />
        <meshStandardMaterial
          color="#c4aa80"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Outer ring */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
      >
        <ringGeometry args={[4.5, 5, 24]} />
        <meshStandardMaterial
          color="#9e8a62"
          roughness={0.92}
          metalness={0}
        />
      </mesh>

      {/* Path to entrance */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 8]}
      >
        <planeGeometry args={[3.5, 8]} />
        <meshStandardMaterial
          color="#c8b48a"
          roughness={0.88}
          metalness={0}
        />
      </mesh>

      {/* Steps */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          receiveShadow
          castShadow
          position={[
            0,
            i * 0.12,
            4.5 + i * 0.25,
          ]}
        >
          <boxGeometry args={[4, 0.12, 0.8]} />
          <meshStandardMaterial
            color="#b8a07a"
            roughness={0.9}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Window glow planes ──────────────────────────────────────────────────────
function WindowGlows() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat =
        ref.current.material as THREE.MeshBasicMaterial;

      mat.opacity =
        0.18 +
        Math.sin(clock.elapsedTime * 0.7) * 0.04;
    }
  });

  return (
    <>
      {/* Front façade windows */}
      {[-4.8, -2.4, 0, 2.4, 4.8].map((x, i) => (
        <mesh
          key={i}
          ref={i === 2 ? ref : undefined}
          position={[x, 2.5, 5.0]}
        >
          <planeGeometry args={[0.8, 1.0]} />
          <meshBasicMaterial
            color="#f4a83a"
            transparent
            opacity={0.22}
          />
        </mesh>
      ))}

      {/* Side windows */}
      {[-2, 0, 2].map((z, i) => (
        <mesh
          key={`l${i}`}
          position={[-6.05, 2.5, z]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[0.8, 1.0]} />
          <meshBasicMaterial
            color="#f4a83a"
            transparent
            opacity={0.18}
          />
        </mesh>
      ))}

      {[-2, 0, 2].map((z, i) => (
        <mesh
          key={`r${i}`}
          position={[6.05, 2.5, z]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <planeGeometry args={[0.8, 1.0]} />
          <meshBasicMaterial
            color="#f4a83a"
            transparent
            opacity={0.18}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── Complete Mosque ─────────────────────────────────────────────────────────
export default function MosqueGeometry() {
  const {
    stone,
    stoneDark,
    domeGold,
    marble,
    courtyard,
    archDark,
  } = useMaterials();

  // Slow subtle drift on entire model
  const rootRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (rootRef.current) {
      rootRef.current.position.y =
        Math.sin(clock.elapsedTime * 0.18) * 0.04;
    }
  });

  return (
    <group ref={rootRef}>
      {/* ── Ground / Courtyard ── */}
      <CourtyardFloor mat={courtyard} />

      {/* ── Main prayer hall body ── */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 2.4, 0]}
      >
        <boxGeometry args={[12, 4.8, 11]} />
        <primitive object={stone} attach="material" />
      </mesh>

      {/* ── Façade string course ── */}
      <mesh
        castShadow
        position={[0, 4.6, 5.6]}
      >
        <boxGeometry args={[12, 0.18, 0.3]} />
        <primitive object={marble} attach="material" />
      </mesh>

      {/* ── Window rows ── */}
      <WindowRow
        count={5}
        y={2.5}
        z={5.55}
        mat={marble}
      />

      <WindowRow
        count={3}
        y={2.5}
        z={-5.55}
        mat={marble}
      />

      {/* ── Entrance Iwan ── */}
      <EntranceIwan
        mat={stone}
        dark={archDark}
      />

      {/* ── Central dome ── */}
      <Dome
        position={[0, 5.0, 0]}
        radius={2.8}
        drumH={1.0}
        mat={stone}
        gold
      />

      {/* ── Flanking smaller domes ── */}
      <Dome
        position={[-4.5, 4.9, 0]}
        radius={1.4}
        drumH={0.65}
        mat={stone}
      />

      <Dome
        position={[4.5, 4.9, 0]}
        radius={1.4}
        drumH={0.65}
        mat={stone}
      />

      <Dome
        position={[0, 4.9, -4]}
        radius={1.1}
        drumH={0.55}
        mat={stone}
      />

      {/* ── Corner minarets ── */}
      <Minaret
        position={[-7.2, 0, -6.8]}
        mat={stone}
      />

      <Minaret
        position={[7.2, 0, -6.8]}
        mat={stone}
      />

      <Minaret
        position={[-7.2, 0, 6.8]}
        mat={stone}
      />

      <Minaret
        position={[7.2, 0, 6.8]}
        mat={stone}
      />

      {/* ── Roof crenellations ── */}
      <Crenellations
        count={14}
        length={12}
        y={5.06}
        z={5.6}
        mat={stone}
      />

      <Crenellations
        count={14}
        length={12}
        y={5.06}
        z={-5.5}
        mat={stone}
        rotY={0}
      />

      <Crenellations
        count={12}
        length={11}
        y={5.06}
        z={0}
        mat={stone}
        rotY={Math.PI / 2}
      />

      <Crenellations
        count={12}
        length={11}
        y={5.06}
        z={0}
        mat={stone}
        rotY={-Math.PI / 2}
      />

      {/* ── Courtyard walls ── */}
      <CourtyardWall
        length={26}
        position={[0, 0, 15]}
        rotY={0}
        mat={stoneDark}
      />

      <CourtyardWall
        length={26}
        position={[0, 0, -13]}
        rotY={0}
        mat={stoneDark}
      />

      <CourtyardWall
        length={28}
        position={[-13, 0, 1]}
        rotY={Math.PI / 2}
        mat={stoneDark}
      />

      <CourtyardWall
        length={28}
        position={[13, 0, 1]}
        rotY={-Math.PI / 2}
        mat={stoneDark}
      />

      {/* ── Gate towers at courtyard entrance ── */}
      {[-4, 4].map((x, i) => (
        <group
          key={i}
          position={[x, 0, 15]}
        >
          <mesh
            castShadow
            receiveShadow
            position={[0, 1.8, 0]}
          >
            <boxGeometry args={[2.4, 3.6, 1.4]} />
            <primitive
              object={stoneDark}
              attach="material"
            />
          </mesh>

          <Dome
            position={[0, 3.8, 0]}
            radius={0.85}
            drumH={0.4}
            mat={stoneDark}
          />
        </group>
      ))}

      {/* ── Lamp posts in courtyard ── */}
      {[
        [-6, 8],
        [6, 8],
        [-6, -6],
        [6, -6],
      ].map(([x, z], i) => (
        <group
          key={i}
          position={[x, 0, z]}
        >
          <mesh
            castShadow
            position={[0, 1.5, 0]}
          >
            <cylinderGeometry
              args={[0.05, 0.07, 3, 6]}
            />
            <meshStandardMaterial
              color="#8b6914"
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          {/* Lantern glow */}
          <pointLight
            color="#f4a050"
            intensity={2.5}
            distance={7}
            decay={2}
            position={[0, 3.1, 0]}
            castShadow={false}
          />

          <mesh position={[0, 3.1, 0]}>
            <octahedronGeometry args={[0.15]} />
            <meshBasicMaterial color="#f8c060" />
          </mesh>
        </group>
      ))}

      {/* ── Window glow planes ── */}
      <WindowGlows />

      {/* ── Decorative ring on main dome ── */}
      <mesh
        position={[0, 5.05, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry
          args={[2.78, 0.08, 8, 32]}
        />
        <primitive
          object={domeGold}
          attach="material"
        />
      </mesh>

      {/* ── Gold band on drum ── */}
      <mesh position={[0, 5.0, 0]}>
        <cylinderGeometry
          args={[2.82, 2.82, 0.14, 24]}
        />
        <primitive
          object={domeGold}
          attach="material"
        />
      </mesh>
    </group>
  );
}