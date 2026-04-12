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

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + offset;
      ref.current.rotation.z = Math.sin(t * 0.8) * 0.05;
      ref.current.rotation.x = Math.cos(t * 0.6) * 0.03;
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 1.2, 6]} />
        <meshStandardMaterial color="#6B8E23" flatShading />
      </mesh>
      {/* Reed top */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.04, 0.02, 0.25, 6]} />
        <meshStandardMaterial color="#8B7355" flatShading />
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

const Environment = () => {
  return (
    <group>
      {/* Trees around the pond */}
      <Tree position={[-8, -0.6, -4]} scale={1.2} />
      <Tree position={[-10, -0.6, -8]} scale={0.9} />
      <Tree position={[-9, -0.6, -14]} scale={1.1} />
      <Tree position={[8, -0.6, -5]} scale={1.0} />
      <Tree position={[10, -0.6, -10]} scale={1.3} />
      <Tree position={[7, -0.6, -15]} scale={0.8} />
      <Tree position={[-6, -0.6, -18]} scale={1.0} />
      <Tree position={[5, -0.6, -18]} scale={1.1} />
      <Tree position={[-12, -0.6, -12]} scale={0.7} />
      <Tree position={[12, -0.6, -7]} scale={0.9} />

      {/* Rocks near pond edge */}
      <Rock position={[-5, -0.5, -2]} scale={0.8} color="#777" />
      <Rock position={[6, -0.5, -3]} scale={1.1} color="#666" />
      <Rock position={[-7, -0.5, -14]} scale={0.6} color="#888" />
      <Rock position={[7, -0.5, -16]} scale={0.9} color="#777" />
      <Rock position={[3, -0.5, -1]} scale={0.5} color="#999" />
      <Rock position={[-3, -0.5, -17]} scale={0.7} color="#666" />

      {/* Reeds at pond edges */}
      <Reed position={[-5.5, -0.5, -3]} />
      <Reed position={[-5.8, -0.5, -3.3]} />
      <Reed position={[-5.3, -0.5, -3.6]} />
      <Reed position={[6.2, -0.5, -4]} />
      <Reed position={[6.5, -0.5, -3.7]} />
      <Reed position={[-6.5, -0.5, -12]} />
      <Reed position={[-6.8, -0.5, -12.5]} />
      <Reed position={[5.5, -0.5, -15]} />
      <Reed position={[5.8, -0.5, -15.3]} />
      <Reed position={[5.2, -0.5, -14.7]} />

      {/* Flowers scattered on ground */}
      <Flower position={[-4, -0.55, -1]} color="#FF69B4" />
      <Flower position={[4, -0.55, -2]} color="#FFD700" />
      <Flower position={[-8, -0.55, -6]} color="#FF6347" />
      <Flower position={[9, -0.55, -8]} color="#DDA0DD" />
      <Flower position={[-7, -0.55, -16]} color="#87CEEB" />
      <Flower position={[6, -0.55, -17]} color="#FF69B4" />

      {/* Mushrooms */}
      <Mushroom position={[-9.5, -0.55, -5]} />
      <Mushroom position={[9, -0.55, -12]} />
      <Mushroom position={[-11, -0.55, -10]} />

      {/* Grass tufts (simple low-poly) */}
      <GrassPatch position={[-3, -0.58, 0]} />
      <GrassPatch position={[2, -0.58, -1]} />
      <GrassPatch position={[-6, -0.58, -7]} />
      <GrassPatch position={[7, -0.58, -6]} />
      <GrassPatch position={[-5, -0.58, -16]} />
      <GrassPatch position={[4, -0.58, -19]} />
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
