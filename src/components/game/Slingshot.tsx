import { useMemo } from 'react';
import * as THREE from 'three';

interface SlingshotProps {
  pullBack: THREE.Vector3;
  isPulling: boolean;
  stoneColor: string;
}

const Slingshot = ({ pullBack, isPulling, stoneColor }: SlingshotProps) => {
  const leftForkTop = useMemo(() => new THREE.Vector3(-0.12, 0.5, 0), []);
  const rightForkTop = useMemo(() => new THREE.Vector3(0.12, 0.5, 0), []);
  
  const stonePos = useMemo(() => {
    if (isPulling) {
      return new THREE.Vector3(
        pullBack.x * 0.3,
        0.38 + pullBack.y * 0.1,
        pullBack.z * 0.5
      );
    }
    return new THREE.Vector3(0, 0.38, 0);
  }, [isPulling, pullBack]);

  return (
    <group position={[0, -0.3, 2.8]}>
      {/* Handle - tapered wood */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.5, 8]} />
        <meshStandardMaterial color="#6B3A2A" flatShading />
      </mesh>
      {/* Handle wrap detail */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.15, 8]} />
        <meshStandardMaterial color="#4a2a1a" flatShading />
      </mesh>

      {/* Y-fork base */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />
        <meshStandardMaterial color="#7B4A30" flatShading />
      </mesh>

      {/* Left fork - angled */}
      <mesh position={[-0.09, 0.32, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.03, 0.04, 0.38, 8]} />
        <meshStandardMaterial color="#7B4A30" flatShading />
      </mesh>
      {/* Right fork - angled */}
      <mesh position={[0.09, 0.32, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.03, 0.04, 0.38, 8]} />
        <meshStandardMaterial color="#7B4A30" flatShading />
      </mesh>

      {/* Fork tips - small knobs */}
      <mesh position={[-0.13, 0.51, 0]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshStandardMaterial color="#8B5A3A" flatShading />
      </mesh>
      <mesh position={[0.13, 0.51, 0]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshStandardMaterial color="#8B5A3A" flatShading />
      </mesh>

      {/* Rubber band - left */}
      <RubberBand from={leftForkTop} to={stonePos} />
      {/* Rubber band - right */}
      <RubberBand from={rightForkTop} to={stonePos} />

      {/* Stone in pouch */}
      <mesh position={[stonePos.x, stonePos.y, stonePos.z]}>
        <dodecahedronGeometry args={[0.08, 1]} />
        <meshStandardMaterial color={stoneColor} flatShading />
      </mesh>

      {/* Pouch (leather piece holding stone) */}
      <mesh position={[stonePos.x, stonePos.y - 0.02, stonePos.z]}>
        <boxGeometry args={[0.12, 0.03, 0.06]} />
        <meshStandardMaterial color="#5a3a2a" flatShading />
      </mesh>
    </group>
  );
};

const RubberBand = ({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) => {
  const { mid, len, quat } = useMemo(() => {
    const m = from.clone().add(to).multiplyScalar(0.5);
    const dir = to.clone().sub(from);
    const l = dir.length();
    const q = new THREE.Quaternion();
    if (l > 0.001) {
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    }
    return { mid: m, len: l, quat: q };
  }, [from, to]);

  return (
    <mesh position={[mid.x, mid.y, mid.z]} quaternion={quat}>
      <cylinderGeometry args={[0.015, 0.015, len, 6]} />
      <meshStandardMaterial color="#8B4513" flatShading />
    </mesh>
  );
};

export default Slingshot;
