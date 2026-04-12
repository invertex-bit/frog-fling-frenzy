import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import Pond from './Pond';
import LilyPad from './LilyPad';
import Frog from './Frog';
import Slingshot from './Slingshot';
import Projectile from './Projectile';
import Ripple from './Ripple';
import { playSplash, playCroak, playStretch, playShoot, playFrogJump } from './SoundEffects';

const STONE_COLORS = ['#e53935', '#fdd835', '#1e88e5', '#43a047'];
const LILY_PAD_POSITIONS: [number, number, number][] = [
  [-3, -0.45, -7],
  [2, -0.45, -9],
  [-1, -0.45, -11],
  [4, -0.45, -6],
  [-4, -0.45, -10],
  [0, -0.45, -13],
  [3, -0.45, -12],
];

interface FrogData {
  id: string;
  padIndex: number;
  shouldDodge: boolean;
  visible: boolean;
  respawnTimer: number | null;
  isSpawning: boolean;
}

interface ProjectileData {
  id: string;
  startPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
}

interface RippleData {
  id: string;
  position: THREE.Vector3;
}

const getRandomColor = () => STONE_COLORS[Math.floor(Math.random() * STONE_COLORS.length)];

const pickRandomPads = (count: number, exclude: number[] = []) => {
  const available = LILY_PAD_POSITIONS.map((_, i) => i).filter((i) => !exclude.includes(i));
  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const InputHandler = ({
  onShoot,
  pullBackRef,
  setPullBack,
  setIsPulling,
}: {
  onShoot: (velocity: THREE.Vector3) => void;
  pullBackRef: React.MutableRefObject<THREE.Vector3>;
  setPullBack: (v: THREE.Vector3) => void;
  setIsPulling: (v: boolean) => void;
}) => {
  const { gl } = useThree();
  const isDragging = useRef(false);
  const startPoint = useRef(new THREE.Vector2());

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      startPoint.current.set(e.clientX, e.clientY);
      setIsPulling(true);
      setPullBack(new THREE.Vector3(0, 0, 0));
    };

    let lastStretchTime = 0;
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = (e.clientX - startPoint.current.x) / window.innerWidth;
      const dy = (e.clientY - startPoint.current.y) / window.innerHeight;
      const newPull = new THREE.Vector3(-dx * 2, dy * 2, dy * 3);
      setPullBack(newPull);
      // Stretch sound throttled
      const now = performance.now();
      if (now - lastStretchTime > 120) {
        playStretch(newPull.length());
        lastStretchTime = now;
      }
    };

    const onPointerUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setIsPulling(false);

      const pb = pullBackRef.current;
      const power = pb.length() * 15;
      if (power > 0.5) {
        const vel = new THREE.Vector3(
          pb.x * 8,
          Math.abs(pb.y) * 10 + 3,
          -Math.abs(pb.z) * 8 - 5
        );
        playShoot(pb.length());
        onShoot(vel);
      }
      setPullBack(new THREE.Vector3(0, 0, 0));
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl, pullBackRef, setPullBack, setIsPulling, onShoot]);

  return null;
};

const FrogManager = ({
  frogs,
  onDodge,
}: {
  frogs: FrogData[];
  onDodge: (id: string) => void;
}) => {
  return (
    <>
      {frogs
        .filter((f) => f.visible)
        .map((frog) => (
          <Frog
            key={frog.id}
            id={frog.id}
            position={LILY_PAD_POSITIONS[frog.padIndex]}
            onDodge={onDodge}
            shouldDodge={frog.shouldDodge}
            isSpawning={frog.isSpawning}
          />
        ))}
    </>
  );
};

const RespawnManager = ({
  frogs,
  setFrogs,
  addRipple,
}: {
  frogs: FrogData[];
  setFrogs: React.Dispatch<React.SetStateAction<FrogData[]>>;
  addRipple: (position: THREE.Vector3) => void;
}) => {
  useFrame((_, delta) => {
    setFrogs((prev) =>
      prev.map((f) => {
        if (f.respawnTimer !== null) {
          const newTimer = f.respawnTimer - delta;
          if (newTimer <= 0) {
            const usedPads = prev.filter((ff) => ff.visible).map((ff) => ff.padIndex);
            const available = pickRandomPads(1, usedPads);
            if (available.length > 0) {
              const padPos = LILY_PAD_POSITIONS[available[0]];
              addRipple(new THREE.Vector3(padPos[0], padPos[1], padPos[2]));
              return {
                ...f,
                padIndex: available[0],
                visible: true,
                shouldDodge: false,
                respawnTimer: null,
                isSpawning: true,
                id: `frog-${Date.now()}-${Math.random()}`,
              };
            }
          }
          return { ...f, respawnTimer: newTimer };
        }
        return f;
      })
    );
  });

  return null;
};

const Ground = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
    <planeGeometry args={[50, 50]} />
    <meshStandardMaterial color="#5a8a3c" flatShading />
  </mesh>
);

const GameWorld = () => {
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([]);
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const [pullBack, setPullBack] = useState(new THREE.Vector3(0, 0, 0));
  const pullBackRef = useRef(pullBack);
  const [isPulling, setIsPulling] = useState(false);
  const [currentColor, setCurrentColor] = useState(getRandomColor());

  // Keep ref in sync
  useEffect(() => { pullBackRef.current = pullBack; }, [pullBack]);

  const initialPads = useMemo(() => pickRandomPads(4), []);
  const [frogs, setFrogs] = useState<FrogData[]>(
    initialPads.map((padIdx, i) => ({
      id: `frog-${i}`,
      padIndex: padIdx,
      shouldDodge: false,
      visible: true,
      respawnTimer: null,
      isSpawning: false,
    }))
  );

  const addRipple = useCallback((position: THREE.Vector3) => {
    const id = `ripple-${Date.now()}-${Math.random()}`;
    setRipples((prev) => [...prev, { id, position }]);
  }, []);

  const removeRipple = useCallback((id: string) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleFrogDodge = useCallback(
    (id: string) => {
      setFrogs((prev) =>
        prev.map((f) => {
          if (f.id === id) {
            const pos = LILY_PAD_POSITIONS[f.padIndex];
            addRipple(new THREE.Vector3(pos[0], pos[1], pos[2]));
            return { ...f, visible: false, shouldDodge: false, isSpawning: false, respawnTimer: 3 + Math.random() * 2 };
          }
          return f;
        })
      );
    },
    [addRipple]
  );

  const checkFrogHit = useCallback(
    (projectilePos: THREE.Vector3) => {
      setFrogs((prev) =>
        prev.map((f) => {
          if (!f.visible || f.shouldDodge) return f;
          const frogPos = LILY_PAD_POSITIONS[f.padIndex];
          const dist = projectilePos.distanceTo(new THREE.Vector3(frogPos[0], frogPos[1], frogPos[2]));
          if (dist < 2.5) {
            return { ...f, shouldDodge: true };
          }
          return f;
        })
      );
    },
    []
  );

  const handleShoot = useCallback(
    (velocity: THREE.Vector3) => {
      const id = `proj-${Date.now()}`;
      const startPosition = new THREE.Vector3(0, -0.5, 1.5);
      setProjectiles((prev) => [...prev, { id, startPosition, velocity, color: currentColor }]);
      setCurrentColor(getRandomColor());
    },
    [currentColor]
  );

  const removeProjectile = useCallback((id: string) => {
    setProjectiles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <>
      <InputHandler
        onShoot={handleShoot}
        pullBackRef={pullBackRef}
        setPullBack={setPullBack}
        setIsPulling={setIsPulling}
      />
      <RespawnManager frogs={frogs} setFrogs={setFrogs} addRipple={addRipple} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-3, 8, -5]} intensity={0.3} />

      {/* Sky */}
      <Sky sunPosition={[50, 30, -20]} turbidity={3} rayleigh={0.5} />

      {/* Environment */}
      <Ground />
      <Pond />

      {/* Lily pads */}
      {LILY_PAD_POSITIONS.map((pos, i) => (
        <LilyPad key={i} position={pos} />
      ))}

      {/* Frogs */}
      <FrogManager frogs={frogs} onDodge={handleFrogDodge} />

      {/* Slingshot */}
      <Slingshot pullBack={pullBack} isPulling={isPulling} stoneColor={currentColor} />

      {/* Projectiles */}
      {projectiles.map((proj) => (
        <Projectile
          key={proj.id}
          id={proj.id}
          startPosition={proj.startPosition}
          velocity={proj.velocity}
          color={proj.color}
          onHitWater={addRipple}
          onRemove={removeProjectile}
          checkFrogHit={checkFrogHit}
        />
      ))}

      {/* Ripples */}
      {ripples.map((ripple) => (
        <Ripple
          key={ripple.id}
          position={ripple.position}
          onComplete={() => removeRipple(ripple.id)}
        />
      ))}
    </>
  );
};

const GameScene = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', cursor: 'crosshair' }}>
      <Canvas
        camera={{ position: [0, 1, 4], fov: 60, near: 0.1, far: 100 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <GameWorld />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.5)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default GameScene;
