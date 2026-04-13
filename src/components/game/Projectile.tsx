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

    vel.current.y += GRAVITY * delta;
    pos.current.add(vel.current.clone().multiplyScalar(delta));

    ref.current.position.copy(pos.current);
    ref.current.rotation.x += delta * 5;
    ref.current.rotation.z += delta * 3;

    checkFrogHit(pos.current);

    if (pos.current.y < -0.5) {
      alive.current = false;
      // Only create ripple if landing in pond (center 0,-0.5,-8, radius 12)
      const dx = pos.current.x - 0;
      const dz = pos.current.z - (-8);
      if (Math.sqrt(dx * dx + dz * dz) <= 12) {
        onHitWater(pos.current.clone());
      }
      onRemove(id);
    }

    if (pos.current.z < -25 || time.current > 5) {
      alive.current = false;
      onRemove(id);
    }
  });

  return (
    <mesh ref={ref} position={startPosition.toArray()}>
      <dodecahedronGeometry args={[0.1, 1]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
};

export default Projectile;
