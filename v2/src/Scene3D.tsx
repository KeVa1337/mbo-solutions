import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, RoundedBox } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import PhoneScreen from "./PhoneScreen";
import { Logo } from "./ui";

// Scroll-driven product shot: a graphite phone turns from its back to its screen,
// rings open up behind it, and the screen shows a client site being built.

const W = 1.56, H = 3.2, D = 0.17;
const SCREEN_PX = 320;
const SCREEN_W = W - 0.1;
// drei <Html transform>: 1 css px = distanceFactor / 400 world units
const DF = (SCREEN_W / SCREEN_PX) * 400;

// per-step pose of the phone after it has turned to the front
const poses = [
  { y: 0.32, x: 0.04 },
  { y: -0.28, x: 0.02 },
  { y: 0.22, x: -0.08 },
  { y: -0.12, x: 0.18 },
  { y: 0, x: 0 },
];

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

type Props = { progress: MotionValue<number>; stage: number; accent: string; light: boolean };

function Phone({ progress, stage, accent }: Props) {
  const group = useRef<THREE.Group>(null);
  const front = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const rings = useRef<THREE.Group>(null);
  const { size, viewport } = useThree();
  const wide = size.width >= 1024;

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const p = progress.get();
    const turn = ease(clamp01(p / 0.14));
    const pose = poses[stage];
    const t = state.clock.elapsedTime;
    // back (π) → front, then the per-step pose, plus a slow idle sway and pointer parallax
    const ry = Math.PI * (1 - turn) + pose.y * turn + Math.sin(t * 0.7) * 0.05 + state.pointer.x * 0.12;
    const rx = pose.x * turn + Math.cos(t * 0.5) * 0.03 - state.pointer.y * 0.08;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ry, 5, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, rx, 5, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, (1 - turn) * -0.18, 5, dt);

    // desktop: phone on the right; phones: centred in the upper part
    const tx = wide ? Math.min(viewport.width * 0.22, 2.6) : 0;
    const ty = wide ? 0 : viewport.height * 0.14;
    const s = (wide ? 1 : Math.min(1, viewport.height / 9.5)) * (0.84 + 0.1 * turn + (stage === 4 ? 0.05 : 0));
    g.position.x = THREE.MathUtils.damp(g.position.x, tx, 4, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, ty + Math.sin(t * 0.9) * 0.04, 4, dt);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 4, dt));

    // show whichever face looks at the camera
    const facing = Math.cos(g.rotation.y) * Math.cos(g.rotation.x);
    if (front.current) front.current.style.opacity = facing > 0.05 ? "1" : "0";
    if (back.current) back.current.style.opacity = facing < -0.05 ? "1" : "0";

    if (rings.current) {
      rings.current.position.copy(g.position).setZ(-0.8);
      const open = 0.35 + turn * 0.6 + stage * 0.04;
      rings.current.children.forEach((r, i) => {
        r.scale.setScalar(THREE.MathUtils.damp(r.scale.x, open * (1 + i * 0.32), 3, dt));
        r.rotation.z += dt * (0.05 + i * 0.03) * (i % 2 ? -1 : 1);
      });
    }
  });

  return (
    <>
      <group ref={rings}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, i]}>
            <torusGeometry args={[2.1, 0.008 + i * 0.002, 16, 160]} />
            <meshBasicMaterial color={accent} transparent opacity={0.34 - i * 0.07} />
          </mesh>
        ))}
      </group>

      <group ref={group} rotation={[0, Math.PI, 0]}>
        {/* body */}
        <RoundedBox args={[W, H, D]} radius={0.2} smoothness={8}>
          <meshPhysicalMaterial color="#1c1c22" metalness={0.85} roughness={0.32} clearcoat={1} clearcoatRoughness={0.25} />
        </RoundedBox>
        {/* glass front */}
        <RoundedBox args={[W - 0.06, H - 0.06, 0.01]} radius={0.17} smoothness={6} position={[0, 0, D / 2 + 0.001]}>
          <meshPhysicalMaterial color="#050507" metalness={0.2} roughness={0.08} clearcoat={1} />
        </RoundedBox>
        {/* camera bump */}
        <group position={[-W / 2 + 0.42, H / 2 - 0.42, -D / 2 - 0.03]}>
          <RoundedBox args={[0.62, 0.62, 0.06]} radius={0.14} smoothness={6}>
            <meshPhysicalMaterial color="#26262d" metalness={0.7} roughness={0.25} clearcoat={1} />
          </RoundedBox>
          {[[-0.13, 0.13], [0.13, -0.13], [-0.13, -0.13]].map(([x, y], i) => (
            <mesh key={i} position={[x, y, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.05, 40]} />
              <meshPhysicalMaterial color="#09090b" metalness={0.9} roughness={0.1} clearcoat={1} />
            </mesh>
          ))}
        </group>

        {/* drei 10 + React 19 drop the first <Html> mounted in a scene; this empty one takes that hit */}
        <Html>{null}</Html>
        <Html transform distanceFactor={DF} position={[0, -0.2, -D / 2 - 0.004]} rotation={[0, Math.PI, 0]} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
          <div ref={back} className="flex flex-col items-center gap-3" style={{ transition: "opacity .15s", color: "#8c8a96" }}>
            <Logo className="h-9 w-auto" />
            <span className="text-[11px] tracking-[.5em] uppercase">Solutions</span>
          </div>
        </Html>
        <Html transform distanceFactor={DF} position={[0, 0, D / 2 + 0.008]} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
          <div ref={front} style={{ transition: "opacity .15s" }}>
            <PhoneScreen stage={stage} />
          </div>
        </Html>
      </group>
    </>
  );
}

export default function Scene3D(props: Props & { active: boolean; fallback: React.ReactNode }) {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 7.2], fov: 35 }}
      dpr={[1, 2]}
      frameloop={props.active ? "always" : "never"}
      gl={{ antialias: true, alpha: true }}
      fallback={props.fallback}
    >
      <ambientLight intensity={props.light ? 0.7 : 0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <Environment resolution={256}>
        {/* studio light panels built in code, so nothing is downloaded */}
        <Lightformer form="rect" intensity={3} position={[0, 4, 2]} scale={[8, 1, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2} position={[-4, 0, 2]} scale={[1, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.6} color={props.accent} position={[4, -1, 1]} scale={[1, 5, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={1} position={[0, 0, -5]} scale={6} />
      </Environment>
      <Phone {...props} />
    </Canvas>
  );
}
