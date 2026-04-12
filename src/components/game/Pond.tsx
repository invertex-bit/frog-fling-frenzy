import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const WaterMaterial = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#2a7fff') },
    uDeepColor: { value: new THREE.Color('#0a3a7a') },
  }), []);

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      transparent
      opacity={0.75}
      vertexShader={`
        varying vec2 vUv;
        varying vec3 vWorldPos;
        uniform float uTime;
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.y += sin(pos.x * 2.0 + uTime * 1.5) * 0.05 + cos(pos.z * 1.5 + uTime) * 0.03;
          vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `}
      fragmentShader={`
        uniform vec3 uColor;
        uniform vec3 uDeepColor;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          float depth = smoothstep(0.0, 1.0, length(vUv - 0.5) * 1.5);
          vec3 color = mix(uColor, uDeepColor, depth);
          float sparkle = sin(vWorldPos.x * 10.0 + uTime * 3.0) * cos(vWorldPos.z * 8.0 + uTime * 2.0);
          color += sparkle * 0.04;
          gl_FragColor = vec4(color, 0.75);
        }
      `}
      side={THREE.DoubleSide}
    />
  );
};

const Pond = () => {
  return (
    <group position={[0, -0.5, -8]}>
      {/* Pond basin */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <circleGeometry args={[12, 48]} />
        <meshStandardMaterial color="#3a2a1a" />
      </mesh>
      {/* Water surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[12, 48]} />
        <WaterMaterial />
      </mesh>
    </group>
  );
};

export default Pond;
