import { useRef } from 'react';
import * as THREE from 'three';

interface SlingshotProps {
  pullBack: THREE.Vector3;
  isPulling: boolean;
  stoneColor: string;
}

const Slingshot = ({ pullBack, isPulling, stoneColor }: SlingshotProps) => {
  const leftForkTop = new THREE.Vector3(-0.15, 0.6, 0);
  const rightForkTop = new THREE.Vector3(0.15, 0.6, 0);
  const stonePos = isPulling
    ? new THREE.Vector3(pullBack.x * 0.3, 0.45 + pullBack.y * 0.1, pullBack.z * 0.5)
    : new THREE.Vector3(0, 0.45, 0);

  return (
    <group position={[0, -1.2, 1.5]}>
      {/* Handle */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.6, 6]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>
      {/* Left fork */}
      <mesh position={[-0.12, 0.35, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.03, 0.035, 0.5, 6]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>
      {/* Right fork */}
      <mesh position={[0.12, 0.35, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.03, 0.035, 0.5, 6]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>

      {/* Rubber band - left */}
      <RubberBand from={leftForkTop} to={stonePos} />
      {/* Rubber band - right */}
      <RubberBand from={rightForkTop} to={stonePos} />

      {/* Stone in slingshot */}
      {isPulling && (
        <mesh position={[stonePos.x, stonePos.y, stonePos.z]}>
          <dodecahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial color={stoneColor} flatShading />
        </mesh>
      )}
    </group>
  );
};

const RubberBand = ({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) => {
  const ref = useRef<THREE.Mesh>(null);
  const mid = from.clone().add(to).multiplyScalar(0.5);
  const dir = to.clone().sub(from);
  const len = dir.length();
  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());

  return (
    <mesh ref={ref} position={[mid.x, mid.y, mid.z]} quaternion={quat}>
      <cylinderGeometry args={[0.012, 0.012, len, 4]} />
      <meshStandardMaterial color="#654321" flatShading />
    </mesh>
  );
};

export default Slingshot;
