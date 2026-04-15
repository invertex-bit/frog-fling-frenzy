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
import Environment from './Environment';
import { playSplash, playShoot, playFrogJump, startBackgroundMusic } from './SoundEffects';



const STONE_COLORS = ['#e53935', '#fdd835', '#1e88e5', '#43a047'];
const LILY_PAD_POSITIONS: [number, number, number][] = [
  [-1.5, -0.45, -7],
  [2, -0.45, -9],
  [-0.5, -0.45, -11],
  [3.5, -0.45, -6],
  [-2, -0.45, -10],
  [0.5, -0.45, -13],
  [3, -0.45, -12],
];


interface FrogData {
  id: string;
  padIndex: number;
  shouldDodge: boolean;
  visible: boolean;
  respawnTimer: number | null;
  isSpawning: boolean;
  dodgeTarget: [number, number, number] | null; // target position for dodge jump
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
      e.preventDefault();
      isDragging.current = true;
      startPoint.current.set(e.clientX, e.clientY);
      setIsPulling(true);
      setPullBack(new THREE.Vector3(0, 0, 0));
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const dx = (e.clientX - startPoint.current.x) / window.innerWidth;
      const dy = (e.clientY - startPoint.current.y) / window.innerHeight;
      // Drag down = pull back toward player (positive z), rubber stretches toward camera
      const newPull = new THREE.Vector3(dx * 2, -dy * 2, dy * 3);
      setPullBack(newPull);
    };

    const onPointerUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setIsPulling(false);

      const pb = pullBackRef.current;
      const power = pb.length() * 15;
      if (power > 0.3) {
        // Shoot forward (opposite to pull): negative Z, upward arc
        const vel = new THREE.Vector3(
          -pb.x * 8,
          Math.abs(pb.y) * 10 + 2,
          -Math.abs(pb.z) * 8 - 3
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
            dodgeTarget={frog.dodgeTarget}
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
            // Also exclude pads that dodging frogs are jumping to
            const pendingTargetPads = prev
              .filter((ff) => ff.shouldDodge && ff.dodgeTarget)
              .map((ff) => LILY_PAD_POSITIONS.findIndex(
                (p) => Math.abs(p[0] - ff.dodgeTarget![0]) < 0.1 && Math.abs(p[2] - ff.dodgeTarget![2]) < 0.1
              ))
              .filter((i) => i >= 0);
            const available = pickRandomPads(1, [...usedPads, ...pendingTargetPads]);
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
    <planeGeometry args={[60, 60]} />
    <meshStandardMaterial color="#5a8a3c" flatShading />
  </mesh>
);

const GameWorld = ({ onShot }: { onShot: () => void }) => {
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([]);
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const [pullBack, setPullBack] = useState(new THREE.Vector3(0, 0, 0));
  const pullBackRef = useRef(pullBack);
  const [isPulling, setIsPulling] = useState(false);
  const [currentColor, setCurrentColor] = useState(getRandomColor());

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
      dodgeTarget: null,
    }))
  );

  const addRipple = useCallback((position: THREE.Vector3) => {
    const id = `ripple-${Date.now()}-${Math.random()}`;
    setRipples((prev) => [...prev, { id, position }]);
    playSplash();
  }, []);

  const removeRipple = useCallback((id: string) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleFrogDodge = useCallback(
    (id: string) => {
      setFrogs((prev) => {
        const frog = prev.find((f) => f.id === id);
        if (!frog) return prev;

        const pos = LILY_PAD_POSITIONS[frog.padIndex];

        // Check if frog has a dodge target (neighbor pad)
        if (frog.dodgeTarget) {
          const targetPadIndex = LILY_PAD_POSITIONS.findIndex(
            (p) => Math.abs(p[0] - frog.dodgeTarget![0]) < 0.1 && Math.abs(p[2] - frog.dodgeTarget![2]) < 0.1
          );
          // Verify target pad is still free
          const occupiedPads = prev.filter((ff) => ff.visible && ff.id !== id).map((ff) => ff.padIndex);
          if (targetPadIndex >= 0 && !occupiedPads.includes(targetPadIndex)) {
            // Frog jumps to neighbor pad — no water splash sound
            return prev.map((f) =>
              f.id === id
                ? { ...f, padIndex: targetPadIndex, shouldDodge: false, isSpawning: false, dodgeTarget: null, id: `frog-${Date.now()}-${Math.random()}` }
                : f
            );
          }
        }

        // Frog jumps into water — play splash and ripple
        addRipple(new THREE.Vector3(pos[0], pos[1], pos[2]));
        playFrogJump();
        return prev.map((f) =>
          f.id === id
            ? { ...f, visible: false, shouldDodge: false, isSpawning: false, respawnTimer: 3 + Math.random() * 2, dodgeTarget: null }
            : f
        );
      });
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
            // Find free neighbor pads - also exclude pads that are dodge targets of other frogs
            const usedPads = prev.filter((ff) => ff.visible && ff.id !== f.id).map((ff) => ff.padIndex);
            const pendingTargetPads = prev
              .filter((ff) => ff.shouldDodge && ff.dodgeTarget)
              .map((ff) => LILY_PAD_POSITIONS.findIndex(
                (p) => Math.abs(p[0] - ff.dodgeTarget![0]) < 0.1 && Math.abs(p[2] - ff.dodgeTarget![2]) < 0.1
              ))
              .filter((i) => i >= 0);
            const allOccupied = [...usedPads, ...pendingTargetPads];
            const neighbors = LILY_PAD_POSITIONS
              .map((p, i) => ({ pos: p, idx: i }))
              .filter((p) => {
                if (p.idx === f.padIndex || allOccupied.includes(p.idx)) return false;
                const dx = p.pos[0] - frogPos[0];
                const dz = p.pos[2] - frogPos[2];
                return Math.sqrt(dx * dx + dz * dz) < 5;
              });

            if (neighbors.length > 0 && Math.random() > 0.4) {
              const target = neighbors[Math.floor(Math.random() * neighbors.length)];
              return { ...f, shouldDodge: true, dodgeTarget: target.pos as [number, number, number] };
            }
            return { ...f, shouldDodge: true, dodgeTarget: null };
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
      const startPosition = new THREE.Vector3(0, 0.15, 2.8);
      setProjectiles((prev) => [...prev, { id, startPosition, velocity, color: currentColor }]);
      setCurrentColor(getRandomColor());
      onShot();
    },
    [currentColor, onShot]
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

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-3, 8, -5]} intensity={0.3} />

      <Sky sunPosition={[50, 30, -20]} turbidity={3} rayleigh={0.5} />

      <Ground />
      <Pond />
      <Environment />

      {LILY_PAD_POSITIONS.map((pos, i) => (
        <LilyPad key={i} position={pos} />
      ))}

      <FrogManager frogs={frogs} onDodge={handleFrogDodge} />
      <Slingshot pullBack={pullBack} isPulling={isPulling} stoneColor={currentColor} />

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
  const musicStarted = useRef(false);
  const [shotCount, setShotCount] = useState(0);

  const handleInteraction = useCallback(() => {
    if (!musicStarted.current) {
      musicStarted.current = true;
      startBackgroundMusic();
    }
  }, []);

  const handleShot = useCallback(() => {
    setShotCount((prev) => prev + 1);
  }, []);

  const resetShotCount = useCallback(() => {
    setShotCount(0);
  }, []);

  return (
    <div
      style={{ width: '100vw', height: '100vh', cursor: 'crosshair', touchAction: 'none', position: 'relative' }}
      onPointerDown={handleInteraction}
    >
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 10,
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
        pointerEvents: 'none',
        fontFamily: 'sans-serif',
      }}>
        🪨 {shotCount}
      </div>
      <Canvas
        camera={{ position: [0, 1, 4], fov: 60, near: 0.1, far: 100 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <GameWorld onShot={handleShot} />
      </Canvas>
    </div>
  );
};

export { GameScene };
export const useShotCounter = () => {
  // This is handled via props now
};
export default GameScene;
