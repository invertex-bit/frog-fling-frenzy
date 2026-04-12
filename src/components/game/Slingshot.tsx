import { useMemo } from 'react';
import * as THREE from 'three';

interface SlingshotProps {
  pullBack: THREE.Vector3;
  isPulling: boolean;
  stoneColor: string;
}

const Slingshot = ({ pullBack, isPulling, stoneColor }: SlingshotProps) => {
  const leftForkTop = useMemo(() => new THREE.Vector3(-0.15, 0.6, 0), []);
  const rightForkTop = useMemo(() => new THREE.Vector3(0.15, 0.6, 0), []);
  
  const stonePos = useMemo(() => {
    if (isPulling) {
      return new THREE.Vector3(pullBack.x * 0.3, 0.45 + pullBack.y * 0.1, pullBack.z * 0.5);
    }
    return new THREE.Vector3(0, 0.45, 0);
  }, [isPulling, pullBack]);

  return (
    <group position={[0, -1.2, 1.5]}>
      {/* Handle */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.7, 8]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>
      {/* Left fork */}
      <mesh position={[-0.14, 0.35, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.04, 0.05, 0.55, 8]} />
        <meshStandardMaterial color="#A0522D" flatShading />
      </mesh>
      {/* Right fork */}
      <mesh position={[0.14, 0.35, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.04, 0.05, 0.55, 8]} />
        <meshStandardMaterial color="#A0522D" flatShading />
      </mesh>
      {/* Fork tips */}
      <mesh position={[-0.18, 0.62, 0]}>
        <sphereGeometry args={[0.05, 6, 4]} />
        <meshStandardMaterial color="#A0522D" flatShading />
      </mesh>
      <mesh position={[0.18, 0.62, 0]}>
        <sphereGeometry args={[0.05, 6, 4]} />
        <meshStandardMaterial color="#A0522D" flatShading />
      </mesh>

      {/* Rubber band - left */}
      <RubberBand from={leftForkTop} to={stonePos} />
      {/* Rubber band - right */}
      <RubberBand from={rightForkTop} to={stonePos} />

      {/* Stone always visible (loaded in slingshot) */}
      <mesh position={[stonePos.x, stonePos.y, stonePos.z]}>
        <dodecahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color={stoneColor} flatShading />
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
      <cylinderGeometry args={[0.02, 0.02, len, 6]} />
      <meshStandardMaterial color="#c2185b" flatShading />
    </mesh>
  );
};

export default Slingshot;
