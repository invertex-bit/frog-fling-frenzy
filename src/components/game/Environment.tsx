import { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

const Tree = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    {/* Trunk */}
    <mesh position={[0, 0.8, 0]}>
      <cylinderGeometry args={[0.15, 0.2, 1.6, 8]} />
      <meshStandardMaterial color="#5D4037" flatShading />
    </mesh>
    {/* Foliage layers */}
    <mesh position={[0, 2.0, 0]}>
      <coneGeometry args={[1.0, 1.5, 8]} />
      <meshStandardMaterial color="#2E7D32" flatShading />
    </mesh>
    <mesh position={[0, 2.7, 0]}>
      <coneGeometry args={[0.8, 1.3, 8]} />
      <meshStandardMaterial color="#388E3C" flatShading />
    </mesh>
    <mesh position={[0, 3.3, 0]}>
      <coneGeometry args={[0.5, 1.0, 8]} />
      <meshStandardMaterial color="#43A047" flatShading />
    </mesh>
  </group>
);

const Rock = ({ position, scale = 1, color = "#888" }: { position: [number, number, number]; scale?: number; color?: string }) => {
  const rotation = useMemo(() => [0, Math.random() * Math.PI, 0] as [number, number, number], []);
  return (
    <mesh position={position} scale={scale} rotation={rotation}>
      <dodecahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
};

const Reed = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const height = useMemo(() => 0.8 + Math.random() * 0.6, []);
  const lean = useMemo(() => (Math.random() - 0.5) * 0.15, []);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + offset;
      ref.current.rotation.z = lean + Math.sin(t * 0.6) * 0.04;
      ref.current.rotation.x = Math.cos(t * 0.4) * 0.02;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Main stem - tapered */}
      <mesh position={[0, height * 0.5, 0]}>
        <cylinderGeometry args={[0.015, 0.035, height, 6]} />
        <meshStandardMaterial color="#5a7a30" flatShading />
      </mesh>
      {/* Leaf blade 1 */}
      <mesh position={[-0.05, height * 0.4, 0.02]} rotation={[0.1, 0.2, -0.3]}>
        <boxGeometry args={[0.15, 0.4, 0.01]} />
        <meshStandardMaterial color="#6B8E23" flatShading />
      </mesh>
      {/* Leaf blade 2 */}
      <mesh position={[0.04, height * 0.6, -0.01]} rotation={[-0.05, -0.15, 0.2]}>
        <boxGeometry args={[0.12, 0.35, 0.01]} />
        <meshStandardMaterial color="#7a9e33" flatShading />
      </mesh>
      {/* Cattail top (brown seed head) */}
      <mesh position={[0, height + 0.1, 0]}>
        <cylinderGeometry args={[0.035, 0.03, 0.18, 6]} />
        <meshStandardMaterial color="#6B4226" flatShading />
      </mesh>
      {/* Tip spike */}
      <mesh position={[0, height + 0.25, 0]}>
        <coneGeometry args={[0.015, 0.1, 4]} />
        <meshStandardMaterial color="#7a9e33" flatShading />
      </mesh>
    </group>
  );
};

const Flower = ({ position, color }: { position: [number, number, number]; color: string }) => (
  <group position={position}>
    <mesh position={[0, 0.15, 0]}>
      <cylinderGeometry args={[0.01, 0.015, 0.3, 5]} />
      <meshStandardMaterial color="#4CAF50" flatShading />
    </mesh>
    <mesh position={[0, 0.35, 0]}>
      <sphereGeometry args={[0.06, 6, 4]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  </group>
);

const Mushroom = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.08, 0]}>
      <cylinderGeometry args={[0.03, 0.04, 0.16, 6]} />
      <meshStandardMaterial color="#F5F5DC" flatShading />
    </mesh>
    <mesh position={[0, 0.18, 0]}>
      <sphereGeometry args={[0.08, 8, 6]} />
      <meshStandardMaterial color="#D32F2F" flatShading />
    </mesh>
  </group>
);

const Sun = () => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={ref} position={[-20, 18, -15]}>
      {/* Sun body */}
      <mesh>
        <sphereGeometry args={[2, 16, 12]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      {/* Glow */}
      <mesh>
        <sphereGeometry args={[2.5, 16, 12]} />
        <meshBasicMaterial color="#FFF8DC" transparent opacity={0.3} />
      </mesh>
      {/* Rays */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 3.5, Math.sin(angle) * 3.5, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.3, 1.5, 0.3]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        );
      })}
    </group>
  );
};

const Environment = () => {
  return (
    <group>
      {/* Sun */}
      <Sun />

      {/* Trees on dry land - moved further from pond (pond center at z=-8, radius ~12) */}
      <Tree position={[-14, -0.6, -4]} scale={1.2} />
      <Tree position={[-15, -0.6, -8]} scale={0.9} />
      <Tree position={[-14, -0.6, -14]} scale={1.1} />
      <Tree position={[14, -0.6, -5]} scale={1.0} />
      <Tree position={[15, -0.6, -10]} scale={1.3} />
      <Tree position={[14, -0.6, -15]} scale={0.8} />
      <Tree position={[-13, -0.6, -18]} scale={1.0} />
      <Tree position={[13, -0.6, -18]} scale={1.1} />
      <Tree position={[-16, -0.6, -12]} scale={0.7} />
      <Tree position={[16, -0.6, -7]} scale={0.9} />
      {/* Trees near camera / foreground */}
      <Tree position={[-8, -0.6, 3]} scale={1.0} />
      <Tree position={[9, -0.6, 2]} scale={0.8} />

      {/* Rocks near pond edge */}
      <Rock position={[-6, -0.5, -1]} scale={0.8} color="#777" />
      <Rock position={[7, -0.5, -2]} scale={1.1} color="#666" />
      <Rock position={[-8, -0.5, -18]} scale={0.6} color="#888" />
      <Rock position={[8, -0.5, -18]} scale={0.9} color="#777" />
      <Rock position={[4, -0.5, 0]} scale={0.5} color="#999" />
      <Rock position={[-4, -0.5, -19]} scale={0.7} color="#666" />

      {/* Reeds at pond edges - clustered naturally */}
      <Reed position={[-5.5, -0.5, -1.5]} />
      <Reed position={[-5.8, -0.5, -1.8]} />
      <Reed position={[-5.2, -0.5, -1.3]} />
      <Reed position={[-5.6, -0.5, -1.0]} />
      <Reed position={[6.2, -0.5, -2.5]} />
      <Reed position={[6.5, -0.5, -2.2]} />
      <Reed position={[6.0, -0.5, -2.8]} />
      <Reed position={[-7.0, -0.5, -15]} />
      <Reed position={[-7.3, -0.5, -15.3]} />
      <Reed position={[-6.8, -0.5, -14.8]} />
      <Reed position={[6.0, -0.5, -16]} />
      <Reed position={[6.3, -0.5, -16.3]} />
      <Reed position={[5.8, -0.5, -15.7]} />

      {/* Flowers scattered on ground */}
      <Flower position={[-5, -0.55, 1]} color="#FF69B4" />
      <Flower position={[5, -0.55, 0]} color="#FFD700" />
      <Flower position={[-12, -0.55, -6]} color="#FF6347" />
      <Flower position={[13, -0.55, -8]} color="#DDA0DD" />
      <Flower position={[-12, -0.55, -16]} color="#87CEEB" />
      <Flower position={[12, -0.55, -17]} color="#FF69B4" />

      {/* Mushrooms */}
      <Mushroom position={[-13, -0.55, -5]} />
      <Mushroom position={[13, -0.55, -12]} />
      <Mushroom position={[-15, -0.55, -10]} />

      {/* Grass tufts */}
      <GrassPatch position={[-3, -0.58, 1]} />
      <GrassPatch position={[2, -0.58, 0]} />
      <GrassPatch position={[-7, -0.58, -1]} />
      <GrassPatch position={[8, -0.58, -1]} />
      <GrassPatch position={[-10, -0.58, -18]} />
      <GrassPatch position={[10, -0.58, -19]} />
    </group>
  );
};

const GrassPatch = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {[0, 0.4, 0.8, -0.3, -0.6].map((offsetX, i) => (
      <mesh key={i} position={[offsetX, 0.12, i * 0.1 - 0.2]} rotation={[0, 0, (i - 2) * 0.15]}>
        <coneGeometry args={[0.03, 0.25, 4]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#4CAF50" : "#66BB6A"} flatShading />
      </mesh>
    ))}
  </group>
);

export default Environment;
