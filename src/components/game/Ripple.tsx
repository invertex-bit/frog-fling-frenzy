import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RippleProps {
  position: THREE.Vector3;
  onComplete: () => void;
}

const Ripple = ({ position, onComplete }: RippleProps) => {
  const ref = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);

  useFrame((_, delta) => {
    setProgress((prev) => {
      const next = prev + delta * 0.8;
      if (next >= 1) {
        onComplete();
        return 1;
      }
      return next;
    });

    if (ref.current) {
      ref.current.children.forEach((ring, i) => {
        const offset = i * 0.15;
        const t = Math.max(0, Math.min(1, (progress - offset) / (1 - offset)));
        const scale = 1 + t * 4;
        ring.scale.set(scale, scale, 1);
        (ring as THREE.Mesh).material = new THREE.MeshBasicMaterial({
          color: '#88ccff',
          transparent: true,
          opacity: (1 - t) * 0.5,
          side: THREE.DoubleSide,
        });
      });
    }
  });

  return (
    <group ref={ref} position={[position.x, -0.48, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i}>
          <ringGeometry args={[0.2 + i * 0.1, 0.25 + i * 0.1, 32]} />
          <meshBasicMaterial color="#88ccff" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

export default Ripple;
