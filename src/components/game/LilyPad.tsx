import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LilyPadProps {
  position: [number, number, number];
}

const LilyPad = ({ position }: LilyPadProps) => {
  const ref = useRef<THREE.Group>(null);
  const offset = useRef(Math.random() * Math.PI * 2);
  // Fix: stable random rotation, not regenerated each render
  const randomRotZ = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + offset.current;
      ref.current.position.y = position[1] + Math.sin(t * 0.8) * 0.03;
      ref.current.rotation.x = -Math.PI / 2 + Math.sin(t * 0.5) * 0.015;
      ref.current.rotation.z = randomRotZ + Math.cos(t * 0.6) * 0.015;
    }
  });

  return (
    <group ref={ref} position={position} rotation={[-Math.PI / 2, 0, randomRotZ]}>
      {/* Lily pad */}
      <mesh>
        <circleGeometry args={[0.8, 16, 0, Math.PI * 1.85]} />
        <meshStandardMaterial color="#2d8a3e" side={THREE.DoubleSide} />
      </mesh>
      {/* Slight raised edge */}
      <mesh position={[0, 0, 0.02]}>
        <ringGeometry args={[0.65, 0.8, 16]} />
        <meshStandardMaterial color="#1e6b2e" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export default LilyPad;
