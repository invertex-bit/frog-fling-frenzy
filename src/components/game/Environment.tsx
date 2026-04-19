import { useMemo } from 'react';
import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const Tree = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.8, 0]}>
      <cylinderGeometry args={[0.15, 0.2, 1.6, 8]} />
      <meshStandardMaterial color="#5D4037" flatShading />
    </mesh>
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

const RoundTree = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 1.0, 0]}>
      <cylinderGeometry args={[0.12, 0.18, 2.0, 8]} />
      <meshStandardMaterial color="#6D4C41" flatShading />
    </mesh>
    <mesh position={[0, 2.5, 0]}>
      <sphereGeometry args={[1.0, 8, 6]} />
      <meshStandardMaterial color="#388E3C" flatShading />
    </mesh>
    <mesh position={[-0.5, 2.2, 0.3]}>
      <sphereGeometry args={[0.6, 7, 5]} />
      <meshStandardMaterial color="#2E7D32" flatShading />
    </mesh>
    <mesh position={[0.4, 2.3, -0.3]}>
      <sphereGeometry args={[0.55, 7, 5]} />
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

const Mushroom = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
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

const GrassPatch = ({ position }: { position: [number, number, number] }) => {
  const offsets = useMemo(() => [0, 0.4, 0.8, -0.3, -0.6], []);
  return (
    <group position={position}>
      {offsets.map((offsetX, i) => (
        <mesh key={i} position={[offsetX, 0.12, i * 0.1 - 0.2]} rotation={[0, 0, (i - 2) * 0.15]}>
          <coneGeometry args={[0.03, 0.25, 4]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#4CAF50" : "#66BB6A"} flatShading />
        </mesh>
      ))}
    </group>
  );
};

const GrassClump = ({ position }: { position: [number, number, number] }) => {
  const blades = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const angle = (i / 7) * Math.PI * 2;
      const r = Math.random() * 0.3;
      const height = 0.2 + Math.random() * 0.15;
      const tilt = (Math.random() - 0.5) * 0.3;
      const colorIdx = i % 3;
      return { x: Math.cos(angle) * r, z: Math.sin(angle) * r, height, tilt, colorIdx };
    });
  }, []);

  return (
    <group position={position}>
      {blades.map((b, i) => (
        <mesh key={i} position={[b.x, 0.1, b.z]} rotation={[0, 0, b.tilt]}>
          <coneGeometry args={[0.025, b.height, 4]} />
          <meshStandardMaterial color={b.colorIdx === 0 ? "#4CAF50" : b.colorIdx === 1 ? "#66BB6A" : "#558B2F"} flatShading />
        </mesh>
      ))}
    </group>
  );
};

const Sun = () => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={ref} position={[0, 8, -28]}>
      <mesh>
        <sphereGeometry args={[4, 16, 12]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      <mesh>
        <sphereGeometry args={[5, 16, 12]} />
        <meshBasicMaterial color="#FFF8DC" transparent opacity={0.3} />
      </mesh>
      <pointLight color="#FFD700" intensity={2} distance={80} />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 6.5, Math.sin(angle) * 6.5, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.5, 2.5, 0.5]} />
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
      <Sun />

      {/* Trees along the horizon - left side */}
      <Tree position={[-18, -0.6, -22]} scale={1.2} />
      <Tree position={[-15, -0.6, -23]} scale={0.9} />
      <Tree position={[-12, -0.6, -22]} scale={1.1} />
      <Tree position={[-9, -0.6, -23]} scale={1.0} />
      <Tree position={[-6, -0.6, -22]} scale={0.85} />
      
      {/* Trees along the horizon - center */}
      <Tree position={[-3, -0.6, -23]} scale={1.0} />
      <Tree position={[0, -0.6, -22]} scale={1.15} />
      <Tree position={[3, -0.6, -23]} scale={0.9} />
      <Tree position={[6, -0.6, -22]} scale={1.0} />
      
      {/* Trees along the horizon - right side */}
      <Tree position={[9, -0.6, -23]} scale={1.1} />
      <Tree position={[12, -0.6, -22]} scale={0.8} />
      <Tree position={[15, -0.6, -23]} scale={1.0} />
      <Tree position={[18, -0.6, -22]} scale={1.3} />

      {/* Round trees along horizon */}
      <RoundTree position={[-16.5, -0.6, -21]} scale={0.9} />
      <RoundTree position={[-13.5, -0.6, -24]} scale={1.1} />
      <RoundTree position={[-10.5, -0.6, -21]} scale={0.8} />
      <RoundTree position={[-7.5, -0.6, -24]} scale={1.0} />
      <RoundTree position={[-4.5, -0.6, -21]} scale={0.9} />
      <RoundTree position={[-1.5, -0.6, -24]} scale={1.2} />
      <RoundTree position={[1.5, -0.6, -21]} scale={0.7} />
      <RoundTree position={[4.5, -0.6, -24]} scale={1.0} />
      <RoundTree position={[7.5, -0.6, -21]} scale={0.85} />
      <RoundTree position={[10.5, -0.6, -24]} scale={1.1} />
      <RoundTree position={[13.5, -0.6, -21]} scale={0.75} />
      <RoundTree position={[16.5, -0.6, -24]} scale={0.9} />

      {/* Trees on sides closer to camera */}
      <Tree position={[-14, -0.6, -4]} scale={1.0} />
      <Tree position={[-12, -0.6, -8]} scale={0.9} />
      <Tree position={[14, -0.6, -5]} scale={1.0} />
      <Tree position={[12, -0.6, -9]} scale={0.8} />
      <Tree position={[-8, -0.6, 3]} scale={1.0} />
      <Tree position={[9, -0.6, 2]} scale={0.8} />
      <RoundTree position={[-12, -0.6, -2]} scale={0.9} />
      <RoundTree position={[12, -0.6, -3]} scale={1.1} />
      <RoundTree position={[6, -0.6, 3]} scale={0.7} />
      <RoundTree position={[-6, -0.6, 4]} scale={0.9} />

      {/* Mushrooms along the horizon on grass */}
      <Mushroom position={[-17, -0.55, -21]} scale={1.2} />
      <Mushroom position={[-14, -0.55, -22]} scale={0.9} />
      <Mushroom position={[-11, -0.55, -21.5]} scale={1.0} />
      <Mushroom position={[-8, -0.55, -22.5]} scale={0.8} />
      <Mushroom position={[-5, -0.55, -21]} scale={1.1} />
      <Mushroom position={[-2, -0.55, -22]} scale={0.9} />
      <Mushroom position={[1, -0.55, -21.5]} scale={1.0} />
      <Mushroom position={[4, -0.55, -22]} scale={0.85} />
      <Mushroom position={[7, -0.55, -21]} scale={1.2} />
      <Mushroom position={[10, -0.55, -22.5]} scale={0.8} />
      <Mushroom position={[13, -0.55, -21]} scale={1.0} />
      <Mushroom position={[16, -0.55, -22]} scale={0.9} />

      {/* Mushrooms on sides */}
      <Mushroom position={[-13, -0.55, -5]} />
      <Mushroom position={[13, -0.55, -6]} />
      <Mushroom position={[-11, -0.55, -1]} scale={1.2} />
      <Mushroom position={[10, -0.55, 0]} scale={0.9} />
      <Mushroom position={[-7, -0.55, 3]} scale={0.85} />
      <Mushroom position={[8, -0.55, 2]} scale={0.95} />

      {/* Rocks near pond edge */}
      <Rock position={[-6, -0.5, -1]} scale={0.8} color="#777" />
      <Rock position={[7, -0.5, -2]} scale={1.1} color="#666" />
      <Rock position={[-8, -0.5, -18]} scale={0.6} color="#888" />
      <Rock position={[8, -0.5, -18]} scale={0.9} color="#777" />
      <Rock position={[4, -0.5, 0]} scale={0.5} color="#999" />

      {/* Flowers */}
      <Flower position={[-5, -0.55, 1]} color="#FF69B4" />
      <Flower position={[5, -0.55, 0]} color="#FFD700" />
      <Flower position={[-12, -0.55, -6]} color="#FF6347" />
      <Flower position={[13, -0.55, -8]} color="#DDA0DD" />
      <Flower position={[-9, -0.55, 2]} color="#FFD700" />
      <Flower position={[10, -0.55, 1]} color="#FF6347" />

      {/* Grass patches */}
      <GrassPatch position={[-3, -0.58, 1]} />
      <GrassPatch position={[2, -0.58, 0]} />
      <GrassPatch position={[-7, -0.58, -1]} />
      <GrassPatch position={[8, -0.58, -1]} />
      <GrassPatch position={[-10, -0.58, -18]} />
      <GrassPatch position={[10, -0.58, -19]} />
      <GrassPatch position={[-9, -0.58, 0]} />
      <GrassPatch position={[6, -0.58, 1]} />
      <GrassPatch position={[-11, -0.58, -3]} />
      <GrassPatch position={[11, -0.58, -4]} />
      <GrassPatch position={[0, -0.58, 2]} />
      <GrassPatch position={[-5, -0.58, 3]} />

      {/* Grass clumps */}
      <GrassClump position={[-2, -0.58, 2]} />
      <GrassClump position={[3, -0.58, 1.5]} />
      <GrassClump position={[-8, -0.58, 1]} />
      <GrassClump position={[9, -0.58, 0]} />
      <GrassClump position={[-6, -0.58, -19]} />
      <GrassClump position={[7, -0.58, -19]} />
      <GrassClump position={[-12, -0.58, -1]} />
      <GrassClump position={[12, -0.58, -1]} />
      <GrassClump position={[-4, -0.58, -1]} />
      <GrassClump position={[1, -0.58, -1]} />
      <GrassClump position={[-10, -0.58, -5]} />
      <GrassClump position={[10, -0.58, -6]} />
      <GrassClump position={[-13, -0.58, -8]} />
      <GrassClump position={[14, -0.58, -8]} />
      <GrassClump position={[-11, -0.58, -13]} />
      <GrassClump position={[11, -0.58, -14]} />
      <GrassClump position={[-9, -0.58, -17]} />
      <GrassClump position={[9, -0.58, -17]} />
      <GrassClump position={[0, -0.58, -19]} />
      <GrassClump position={[-3, -0.58, -18]} />
    </group>
  );
};

export default Environment;
