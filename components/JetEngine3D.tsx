"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

function MultiStageFan() {
  const ref = useRef<THREE.Group>(null);
  const backFanRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.z += 0.25; // Main fan fast spin
    }
    if (backFanRef.current) {
      backFanRef.current.rotation.z -= 0.15; // Counter-rotating turbine
    }
  });

  return (
    <group>
      {/* Front Fan Stage */}
      <group ref={ref}>
        {[...Array(24)].map((_, i) => (
          <mesh key={`stage1-${i}`} rotation={[0, 0, (i * Math.PI * 2) / 24]}>
            <boxGeometry args={[0.25, 7.8, 0.4]} />
            <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        {/* Core Cone */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.8]}>
          <coneGeometry args={[1.5, 2.5, 32]} />
          <meshStandardMaterial color="#000" metalness={1} roughness={0.1} />
        </mesh>
      </group>

      {/* Second Fan Stage (Compressor) */}
      <group position={[0, 0, -1.5]} ref={backFanRef}>
        {[...Array(32)].map((_, i) => (
          <mesh key={`stage2-${i}`} rotation={[0, 0, (i * Math.PI * 2) / 32]}>
            <boxGeometry args={[0.2, 5.5, 0.3]} />
            <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Center Shaft */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
        <cylinderGeometry args={[1.2, 1.2, 5, 32]} />
        <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.5} />
      </mesh>
    </group>
  );
}

function FlowParticle({ index, count }: { index: number; count: number }) {
  const ref = useRef<THREE.Group>(null);
  const angle = (index * Math.PI * 2) / count;
  const radius = 1.8 + Math.random() * 2;
  const speed = 4 + Math.random() * 3;
  const offset = Math.random() * 10;

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.z = -5 + ((clock.elapsedTime * speed + offset) % 10);
    }
  });

  return (
    <group position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]} ref={ref}>
      <mesh>
        <sphereGeometry args={[0.04, 8, 8]} />
        {/* Multiply color values for post-processing HDR Bloom */}
        <meshBasicMaterial color={[0, 2.29, 2.55]} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function EngineCore() {
  const casingRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (casingRef.current) casingRef.current.rotation.x -= 0.001;
  });

  return (
    <group>
      {/* Outer Wireframe Casing */}
      <mesh rotation={[Math.PI / 2, 0, 0]} ref={casingRef}>
        <cylinderGeometry args={[4.4, 4.4, 6.5, 64, 1, true]} />
        <meshStandardMaterial
          color="#00e5ff"
          wireframe={true}
          transparent={true}
          opacity={0.15}
        />
      </mesh>

      {/* Internal Combustion / Turbine glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -2.5]}>
        <cylinderGeometry args={[2.5, 1.8, 2.5, 32, 1, true]} />
        <meshStandardMaterial
          color="#ff4400"
          emissive={[4, 0.4, 0]} // HDR emissive for Bloom
          transparent={true}
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Front, Middle, Back Rings */}
      <mesh position={[0, 0, 3.25]}>
        <torusGeometry args={[4.4, 0.04, 32, 128]} />
        {/* Glow color > 1 to trigger bloom threshold */}
        <meshBasicMaterial color={[0, 2.29, 2.55]} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[4.5, 0.02, 16, 128]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0, -3.25]}>
        <torusGeometry args={[4.4, 0.06, 32, 128]} />
        <meshBasicMaterial color={[4, 1, 0]} />
      </mesh>

      <MultiStageFan />

      {/* Fast moving data particles through the engine */}
      {[...Array(40)].map((_, i) => (
        <FlowParticle key={i} index={i} count={40} />
      ))}
    </group>
  );
}

export default function JetEngine3D() {
  return (
    // Standard contained size for the right panel
    <div className="w-full h-[500px] relative pointer-events-none fade-in">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,229,255,0.06)_0%,transparent_60%)]" />

      <Canvas camera={{ position: [8.5, 4.5, 9.5], fov: 48 }}>
        {/* Set canvas background rendering transparent inherently */}
        <ambientLight intensity={1.5} />
        {/* Cool blue key light from front-top-left */}
        <directionalLight position={[10, 10, 8]} intensity={3} color="#00e5ff" />
        {/* Warm orange kicker light from bottom-back */}
        <directionalLight position={[-10, -5, -8]} intensity={2.5} color="#ffaa00" />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
          {/* Tilted to show inside the combustion chamber beautifully */}
          <group rotation={[0, -Math.PI / 5, 0]} scale={1.25}>
            <EngineCore />
          </group>
        </Float>

        {/* Post-processing Bloom makes the HDR emissive parts glow intensely */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={1.5}
            mipmapBlur
            intensity={1.2}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
