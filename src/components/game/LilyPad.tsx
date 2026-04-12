import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LilyPadProps {
  position: [number, number, number];
}

const LilyPad = ({ position }: LilyPadProps) => {
  const ref = useRef<THREE.Group>(null);
  const offset = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + offset.current;
      ref.current.position.y = position[1] + Math.sin(t * 0.8) * 0.03;
      ref.current.rotation.x = Math.sin(t * 0.5) * 0.02;
      ref.current.rotation.z = Math.cos(t * 0.6) * 0.02;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Lily pad */}
      <mesh rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 2]}>
        <circleGeometry args={[0.8, 16, 0, Math.PI * 1.85]} />
        <meshStandardMaterial color="#2d8a3e" side={THREE.DoubleSide} />
      </mesh>
      {/* Slight raised edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.65, 0.8, 16]} />
        <meshStandardMaterial color="#1e6b2e" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export default LilyPad;
