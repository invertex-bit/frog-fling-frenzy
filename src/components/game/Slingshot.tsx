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
  
  // Pull toward player (positive Z = toward camera)
  const stonePos = useMemo(() => {
    if (isPulling) {
      return new THREE.Vector3(
        pullBack.x * 0.3,
        0.38 + pullBack.y * 0.1,
        Math.abs(pullBack.z) * 0.5 + pullBack.y * 0.2
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
      {/* Second wrap */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.048, 0.048, 0.06, 8]} />
        <meshStandardMaterial color="#4a2a1a" flatShading />
      </mesh>

      {/* Y-fork - smooth junction using a sphere at the split point */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.055, 8, 6]} />
        <meshStandardMaterial color="#7B4A30" flatShading />
      </mesh>

      {/* Left fork - angled */}
      <mesh position={[-0.08, 0.33, 0]} rotation={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.03, 0.04, 0.35, 8]} />
        <meshStandardMaterial color="#7B4A30" flatShading />
      </mesh>
      {/* Right fork - angled */}
      <mesh position={[0.08, 0.33, 0]} rotation={[0, 0, -0.18]}>
        <cylinderGeometry args={[0.03, 0.04, 0.35, 8]} />
        <meshStandardMaterial color="#7B4A30" flatShading />
      </mesh>

      {/* Fork tips - small knobs */}
      <mesh position={[-0.12, 0.51, 0]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial color="#8B5A3A" flatShading />
      </mesh>
      <mesh position={[0.12, 0.51, 0]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial color="#8B5A3A" flatShading />
      </mesh>

      {/* Rubber band - left */}
      <RubberBand from={leftForkTop} to={stonePos} />
      {/* Rubber band - right */}
      <RubberBand from={rightForkTop} to={stonePos} />

      {/* Leather pouch (кожеток) */}
      <group position={[stonePos.x, stonePos.y, stonePos.z]}>
        {/* Main pouch - oval leather piece */}
        <mesh position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 8]} />
          <meshStandardMaterial color="#5a3520" flatShading />
        </mesh>
        {/* Pouch rim */}
        <mesh position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.012, 6, 8]} />
          <meshStandardMaterial color="#4a2a18" flatShading />
        </mesh>
        {/* Stone in pouch */}
        <mesh position={[0, 0.03, 0]}>
          <dodecahedronGeometry args={[0.07, 1]} />
          <meshStandardMaterial color={stoneColor} flatShading />
        </mesh>
      </group>
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
      <cylinderGeometry args={[0.012, 0.012, len, 6]} />
      <meshStandardMaterial color="#8B4513" flatShading />
    </mesh>
  );
};

export default Slingshot;
