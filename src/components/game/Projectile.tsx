import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ProjectileProps {
  id: string;
  startPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
  onHitWater: (position: THREE.Vector3) => void;
  onRemove: (id: string) => void;
  checkFrogHit: (position: THREE.Vector3) => void;
}

const GRAVITY = -9.8;

const Projectile = ({ id, startPosition, velocity, color, onHitWater, onRemove, checkFrogHit }: ProjectileProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const vel = useRef(velocity.clone());
  const pos = useRef(startPosition.clone());
  const alive = useRef(true);
  const time = useRef(0);

  useEffect(() => {
    vel.current = velocity.clone();
    pos.current = startPosition.clone();
  }, [startPosition, velocity]);

  useFrame((_, delta) => {
    if (!ref.current || !alive.current) return;

    time.current += delta;

    // Apply gravity
    vel.current.y += GRAVITY * delta;
    pos.current.add(vel.current.clone().multiplyScalar(delta));

    ref.current.position.copy(pos.current);
    ref.current.rotation.x += delta * 5;
    ref.current.rotation.z += delta * 3;

    // Check frog proximity
    checkFrogHit(pos.current);

    // Hit water level or ground
    if (pos.current.y < -0.5) {
      alive.current = false;
      onHitWater(pos.current.clone());
      onRemove(id);
    }

    // Remove if too far
    if (pos.current.z < -25 || time.current > 5) {
      alive.current = false;
      onRemove(id);
    }
  });

  return (
    <mesh ref={ref} position={startPosition.toArray()}>
      <dodecahedronGeometry args={[0.1, 0]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
};

export default Projectile;
