import { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FrogProps {
  position: [number, number, number];
  id: string;
  onDodge: (id: string) => void;
  shouldDodge: boolean;
}

const Frog = ({ position, id, onDodge, shouldDodge }: FrogProps) => {
  const ref = useRef<THREE.Group>(null);
  const [isDodging, setIsDodging] = useState(false);
  const dodgeProgress = useRef(0);
  const idleOffset = useRef(Math.random() * Math.PI * 2);
  const startPos = useRef(new THREE.Vector3(...position));

  const triggerDodge = useCallback(() => {
    if (!isDodging) {
      setIsDodging(true);
      dodgeProgress.current = 0;
      onDodge(id);
    }
  }, [isDodging, id, onDodge]);

  useEffect(() => {
    if (shouldDodge && !isDodging) {
      triggerDodge();
    }
  }, [shouldDodge, isDodging, triggerDodge]);

  useFrame((state, delta) => {
    if (!ref.current) return;

    if (isDodging) {
      dodgeProgress.current += delta * 2;
      const t = Math.min(dodgeProgress.current, 1);
      // Jump arc
      const jumpHeight = Math.sin(t * Math.PI) * 2;
      const sinkDepth = t > 0.5 ? (t - 0.5) * 4 : 0;
      ref.current.position.y = startPos.current.y + jumpHeight - sinkDepth;
      // Rotate during jump
      ref.current.rotation.x = t * Math.PI * 0.3;

      if (t >= 1) {
        ref.current.visible = false;
      }
    } else {
      // Idle breathing animation
      const t = state.clock.elapsedTime + idleOffset.current;
      ref.current.position.y = position[1] + Math.sin(t * 1.2) * 0.02;
      // Occasional blink-like scale
      const breathe = 1 + Math.sin(t * 2) * 0.02;
      ref.current.scale.setScalar(breathe);
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Body */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color="#4CAF50" flatShading />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.35, -0.25]}>
        <sphereGeometry args={[0.22, 8, 6]} />
        <meshStandardMaterial color="#66BB6A" flatShading />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.12, 0.5, -0.32]}>
        <sphereGeometry args={[0.08, 6, 4]} />
        <meshStandardMaterial color="#ffffff" flatShading />
      </mesh>
      <mesh position={[0.12, 0.5, -0.32]}>
        <sphereGeometry args={[0.08, 6, 4]} />
        <meshStandardMaterial color="#ffffff" flatShading />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.12, 0.5, -0.39]}>
        <sphereGeometry args={[0.04, 6, 4]} />
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </mesh>
      <mesh position={[0.12, 0.5, -0.39]}>
        <sphereGeometry args={[0.04, 6, 4]} />
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </mesh>
      {/* Front legs */}
      <mesh position={[-0.25, 0.1, -0.15]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.08, 0.2, 0.08]} />
        <meshStandardMaterial color="#388E3C" flatShading />
      </mesh>
      <mesh position={[0.25, 0.1, -0.15]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.08, 0.2, 0.08]} />
        <meshStandardMaterial color="#388E3C" flatShading />
      </mesh>
      {/* Back legs */}
      <mesh position={[-0.2, 0.1, 0.2]} rotation={[0.3, 0, -0.3]}>
        <boxGeometry args={[0.1, 0.25, 0.12]} />
        <meshStandardMaterial color="#388E3C" flatShading />
      </mesh>
      <mesh position={[0.2, 0.1, 0.2]} rotation={[0.3, 0, 0.3]}>
        <boxGeometry args={[0.1, 0.25, 0.12]} />
        <meshStandardMaterial color="#388E3C" flatShading />
      </mesh>
    </group>
  );
};

export default Frog;
