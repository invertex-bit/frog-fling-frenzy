import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playCroak, playFrogDown, playFrogUp } from './SoundEffects';

type FrogState = 'idle' | 'spawning' | 'dodging' | 'gone';

interface FrogProps {
  position: [number, number, number];
  id: string;
  onDodge: (id: string, landing: [number, number, number] | null) => void;
  shouldDodge: boolean;
  isSpawning?: boolean;
  dodgeTarget?: [number, number, number] | null;
}

const Frog = ({ position, id, onDodge, shouldDodge, isSpawning = false, dodgeTarget = null }: FrogProps) => {
  const ref = useRef<THREE.Group>(null);
  const [state, setState] = useState<FrogState>(isSpawning ? 'spawning' : 'idle');
  const progress = useRef(0);
  const idleOffset = useRef(Math.random() * Math.PI * 2);
  const startPos = useRef(new THREE.Vector3(...position));
  const hasCroaked = useRef(false);

  // Compute dodge direction vector
  const dodgeDir = useMemo(() => {
    if (dodgeTarget) {
      const dx = dodgeTarget[0] - position[0];
      const dz = dodgeTarget[2] - position[2];
      const len = Math.sqrt(dx * dx + dz * dz);
      return { x: dx / len, z: dz / len, dist: len, toWater: false };
    }
    // Random direction into water
    const angle = Math.random() * Math.PI * 2;
    return { x: Math.cos(angle), z: Math.sin(angle), dist: 1.5, toWater: true };
  }, [dodgeTarget, position]);

  useEffect(() => {
    startPos.current.set(...position);
  }, [position]);

  const triggerDodge = useCallback(() => {
    if (state === 'idle') {
      playCroak();
      // Face jump direction immediately
      if (ref.current) {
        const moveX = dodgeDir.x;
        const moveZ = dodgeDir.z;
        const faceAngle = Math.atan2(moveX, moveZ) + Math.PI;
        ref.current.rotation.y = faceAngle;
      }
      // Start jump after 0.1s delay
      setTimeout(() => {
        playFrogDown();
        setState('dodging');
        progress.current = 0;
      }, 100);
      hasCroaked.current = true;
    }
  }, [state, dodgeDir]);

  useEffect(() => {
    if (shouldDodge && state === 'idle') {
      triggerDodge();
    }
  }, [shouldDodge, state, triggerDodge]);

  useEffect(() => {
    if (isSpawning) {
      playFrogUp();
      setTimeout(() => playCroak(), 400);
      setState('spawning');
      progress.current = 0;
    }
  }, [isSpawning]);

  useFrame((clock, delta) => {
    if (!ref.current || state === 'gone') return;

    if (state === 'dodging') {
      progress.current += delta * 1.8;
      const t = Math.min(progress.current, 1);

      const moveX = dodgeDir.x;
      const moveZ = dodgeDir.z;
      const jumpToNeighbor = !dodgeDir.toWater;

      // Face jump direction (add PI because model faces -Z by default)
      const faceAngle = Math.atan2(moveX, moveZ) + Math.PI;

      if (t < 0.15) {
        const crouchT = t / 0.15;
        const yOffset = -crouchT * 0.1;
        ref.current.position.set(startPos.current.x, startPos.current.y + yOffset, startPos.current.z);
        ref.current.scale.set(1 + crouchT * 0.1, 1 - crouchT * 0.15, 1 + crouchT * 0.1);
        ref.current.rotation.y = faceAngle;
      } else if (t < 0.5) {
        const jumpT = (t - 0.15) / 0.35;
        const yOffset = jumpT * 2.2;
        const hDist = jumpT * dodgeDir.dist * 0.6;
        ref.current.position.set(
          startPos.current.x + moveX * hDist,
          startPos.current.y + yOffset,
          startPos.current.z + moveZ * hDist
        );
        const s = 1 + (1 - jumpT) * 0.1;
        ref.current.scale.set(1, s, 1);
        ref.current.rotation.y = faceAngle;
        ref.current.rotation.x = jumpT * -0.5;
      } else {
        const sinkT = (t - 0.5) / 0.5;
        const hDist = (0.6 + sinkT * 0.4) * dodgeDir.dist;

        if (jumpToNeighbor) {
          // Arc to neighbor pad and land
          const yOffset = 2.2 * (1 - sinkT * sinkT);
          const bounce = sinkT > 0.8 ? Math.sin((sinkT - 0.8) / 0.2 * Math.PI) * 0.1 : 0;
          ref.current.position.set(
            startPos.current.x + moveX * hDist,
            startPos.current.y + yOffset + bounce,
            startPos.current.z + moveZ * hDist
          );
          ref.current.scale.setScalar(1);
          ref.current.rotation.x = -0.5 * (1 - sinkT);
        } else {
          // Dive into water
          const yOffset = 2.2 * (1 - sinkT * sinkT) - sinkT * sinkT * 1.5;
          ref.current.position.set(
            startPos.current.x + moveX * hDist,
            startPos.current.y + yOffset,
            startPos.current.z + moveZ * hDist
          );
          ref.current.scale.setScalar(1 - sinkT * 0.4);
          ref.current.rotation.x = -0.5 + sinkT * 1.8;
        }
        ref.current.rotation.y = faceAngle;
      }

      if (t >= 1) {
        setState('gone');
        ref.current.visible = false;
        onDodge(id);
      }
    } else if (state === 'spawning') {
      progress.current += delta * 1.5;
      const t = Math.min(progress.current, 1);

      if (t < 0.4) {
        const riseT = t / 0.4;
        ref.current.position.y = startPos.current.y - 1.5 + riseT * 3.5;
        ref.current.scale.setScalar(0.5 + riseT * 0.5);
        ref.current.rotation.x = -0.3 * (1 - riseT);
      } else if (t < 0.7) {
        const peakT = (t - 0.4) / 0.3;
        ref.current.position.y = startPos.current.y + 2.0 - peakT * 1.8;
        ref.current.scale.setScalar(1);
        ref.current.rotation.x = peakT * 0.1;
      } else {
        const landT = (t - 0.7) / 0.3;
        const bounce = Math.sin(landT * Math.PI) * 0.1;
        ref.current.position.y = startPos.current.y + 0.2 * (1 - landT) + bounce;
        const squash = 1 + Math.sin(landT * Math.PI) * 0.08;
        ref.current.scale.set(1 + (squash - 1) * 0.5, 1 / squash, 1 + (squash - 1) * 0.5);
        ref.current.rotation.x = 0;
      }

      if (t >= 1) {
        setState('idle');
        ref.current.position.set(...position);
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
    <group ref={ref} position={position} rotation={[0, Math.PI, 0]}>
      {/* Body */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.3, 12, 10]} />
        <meshStandardMaterial color="#4CAF50" flatShading />
      </mesh>
      {/* Belly */}
      <mesh position={[0, 0.2, 0.05]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color="#81C784" flatShading />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.35, -0.25]}>
        <sphereGeometry args={[0.22, 12, 10]} />
        <meshStandardMaterial color="#66BB6A" flatShading />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.12, 0.5, -0.32]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial color="#ffffff" flatShading />
      </mesh>
      <mesh position={[0.12, 0.5, -0.32]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial color="#ffffff" flatShading />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.12, 0.5, -0.39]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </mesh>
      <mesh position={[0.12, 0.5, -0.39]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </mesh>
      {/* Mouth line */}
      <mesh position={[0, 0.3, -0.42]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.15, 0.01, 0.01]} />
        <meshStandardMaterial color="#2E7D32" flatShading />
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
      {/* Front feet */}
      <mesh position={[-0.3, 0.02, -0.2]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.03, 0.08]} />
        <meshStandardMaterial color="#2E7D32" flatShading />
      </mesh>
      <mesh position={[0.3, 0.02, -0.2]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.1, 0.03, 0.08]} />
        <meshStandardMaterial color="#2E7D32" flatShading />
      </mesh>
      {/* Back legs */}
      <mesh position={[-0.2, 0.12, 0.2]} rotation={[0.3, 0, -0.3]}>
        <boxGeometry args={[0.1, 0.25, 0.12]} />
        <meshStandardMaterial color="#388E3C" flatShading />
      </mesh>
      <mesh position={[0.2, 0.12, 0.2]} rotation={[0.3, 0, 0.3]}>
        <boxGeometry args={[0.1, 0.25, 0.12]} />
        <meshStandardMaterial color="#388E3C" flatShading />
      </mesh>
      {/* Back feet */}
      <mesh position={[-0.25, 0.02, 0.32]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.12, 0.03, 0.1]} />
        <meshStandardMaterial color="#2E7D32" flatShading />
      </mesh>
      <mesh position={[0.25, 0.02, 0.32]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.12, 0.03, 0.1]} />
        <meshStandardMaterial color="#2E7D32" flatShading />
      </mesh>
    </group>
  );
};

export default Frog;