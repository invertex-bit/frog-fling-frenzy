import { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type FrogState = 'idle' | 'spawning' | 'dodging';

interface FrogProps {
  position: [number, number, number];
  id: string;
  onDodge: (id: string) => void;
  shouldDodge: boolean;
  isSpawning?: boolean;
}

const Frog = ({ position, id, onDodge, shouldDodge, isSpawning = false }: FrogProps) => {
  const ref = useRef<THREE.Group>(null);
  const [state, setState] = useState<FrogState>(isSpawning ? 'spawning' : 'idle');
  const progress = useRef(0);
  const idleOffset = useRef(Math.random() * Math.PI * 2);
  const startPos = useRef(new THREE.Vector3(...position));

  useEffect(() => {
    startPos.current.set(...position);
  }, [position]);

  const triggerDodge = useCallback(() => {
    if (state === 'idle') {
      setState('dodging');
      progress.current = 0;
      onDodge(id);
    }
  }, [state, id, onDodge]);

  useEffect(() => {
    if (shouldDodge && state === 'idle') {
      triggerDodge();
    }
  }, [shouldDodge, state, triggerDodge]);

  useEffect(() => {
    if (isSpawning) {
      setState('spawning');
      progress.current = 0;
    }
  }, [isSpawning]);

  useFrame((clock, delta) => {
    if (!ref.current) return;

    if (state === 'dodging') {
      progress.current += delta * 1.8;
      const t = Math.min(progress.current, 1);

      // Phase 1: crouch (0-0.15), Phase 2: jump up (0.15-0.5), Phase 3: arc down into water (0.5-1.0)
      let yOffset = 0;
      let rotX = 0;
      if (t < 0.15) {
        // Crouch down
        const crouchT = t / 0.15;
        yOffset = -crouchT * 0.1;
        ref.current.scale.set(1 + crouchT * 0.1, 1 - crouchT * 0.15, 1 + crouchT * 0.1);
      } else if (t < 0.5) {
        // Jump up and forward
        const jumpT = (t - 0.15) / 0.35;
        yOffset = jumpT * 2.2;
        rotX = jumpT * -0.5;
        const s = 1 + (1 - jumpT) * 0.1;
        ref.current.scale.set(1, s, 1);
      } else {
        // Arc down into water
        const sinkT = (t - 0.5) / 0.5;
        yOffset = 2.2 * (1 - sinkT * sinkT) - sinkT * sinkT * 1.5;
        rotX = -0.5 + sinkT * 1.2; // tilt forward as diving
        ref.current.scale.setScalar(1 - sinkT * 0.3);
      }

      ref.current.position.y = startPos.current.y + yOffset;
      ref.current.rotation.x = rotX;

      if (t >= 1) {
        ref.current.visible = false;
      }
    } else if (state === 'spawning') {
      progress.current += delta * 1.5;
      const t = Math.min(progress.current, 1);

      // Emerge from water: start below, jump up onto lily pad
      if (t < 0.4) {
        // Rise from water
        const riseT = t / 0.4;
        ref.current.position.y = startPos.current.y - 1.5 + riseT * 3.5;
        ref.current.scale.setScalar(0.5 + riseT * 0.5);
        ref.current.rotation.x = -0.3 * (1 - riseT);
      } else if (t < 0.7) {
        // Peak of jump
        const peakT = (t - 0.4) / 0.3;
        ref.current.position.y = startPos.current.y + 2.0 - peakT * 1.8;
        ref.current.scale.setScalar(1);
        ref.current.rotation.x = peakT * 0.1;
      } else {
        // Land with slight bounce
        const landT = (t - 0.7) / 0.3;
        const bounce = Math.sin(landT * Math.PI) * 0.1;
        ref.current.position.y = startPos.current.y + 0.2 * (1 - landT) + bounce;
        const squash = 1 + Math.sin(landT * Math.PI) * 0.08;
        ref.current.scale.set(1 + (squash - 1) * 0.5, 1 / squash, 1 + (squash - 1) * 0.5);
        ref.current.rotation.x = 0;
      }

      if (t >= 1) {
        setState('idle');
        ref.current.position.y = startPos.current.y;
        ref.current.scale.setScalar(1);
        ref.current.rotation.x = 0;
      }
    } else {
      // Idle breathing
      const t = clock.clock.elapsedTime + idleOffset.current;
      ref.current.position.y = position[1] + Math.sin(t * 1.2) * 0.02;
      const breathe = 1 + Math.sin(t * 2) * 0.02;
      ref.current.scale.setScalar(breathe);
    }
  });

  return (
    // rotation Y = Math.PI → frog faces toward camera (positive Z)
    <group ref={ref} position={position} rotation={[0, Math.PI, 0]}>
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
