import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSphere() {
  const ref = useRef<THREE.Points>(null);
  
  // Generate random particle positions
  const particles = useMemo(() => {
    const temp = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const i3 = i * 3;
      temp[i3] = (Math.random() - 0.5) * 20;
      temp[i3 + 1] = (Math.random() - 0.5) * 20;
      temp[i3 + 2] = (Math.random() - 0.5) * 20;
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8b5cf6"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function FloatingGeometry() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.5;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh position={[-4, 0, -3]}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial 
          color="#ec4899" 
          transparent 
          opacity={0.3} 
          wireframe
        />
      </mesh>
      <mesh position={[4, 2, -2]}>
        <octahedronGeometry args={[0.7, 2]} />
        <meshBasicMaterial 
          color="#06b6d4" 
          transparent 
          opacity={0.2} 
          wireframe
        />
      </mesh>
      <mesh position={[0, -2, -4]}>
        <tetrahedronGeometry args={[0.6, 0]} />
        <meshBasicMaterial 
          color="#10b981" 
          transparent 
          opacity={0.25} 
          wireframe
        />
      </mesh>
    </group>
  );
}

function WaveGrid() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const y = Math.sin(x * 0.5 + time) * Math.cos(z * 0.5 + time) * 0.3;
        positions.setY(i, y);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -8, -10]} rotation={[-Math.PI / 4, 0, 0]}>
      <planeGeometry args={[20, 20, 32, 32]} />
      <meshBasicMaterial 
        color="#7c3aed" 
        transparent 
        opacity={0.1} 
        wireframe
      />
    </mesh>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <AnimatedSphere />
        <FloatingGeometry />
        <WaveGrid />
        
        {/* Gradient fog effect */}
        <fog attach="fog" args={['#0f0f23', 5, 25]} />
      </Canvas>
    </div>
  );
}
