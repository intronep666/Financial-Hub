import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

import LightingRig from '../../scene/LightingRig';
import { useThemeTokens } from '../../context/ThemeContext';
import RadialHealthScore from './RadialHealthScore';


const Halo = ({ palette }) => {
  const geometry = useMemo(() => new THREE.RingGeometry(2.2, 2.6, 32), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} geometry={geometry}>
      <meshBasicMaterial color={palette.primary.base} transparent opacity={0.22} />
    </mesh>
  );
};

const BaseDisk = ({ palette }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]}>
    <cylinderGeometry args={[3.1, 3.1, 0.16, 32]} />
    <meshLambertMaterial color={palette.canvas.light} />
  </mesh>
);

const ScoreText = ({ score, palette }) => (
  <Text
    position={[0, 2.2, 0]}
    fontSize={1.2}
    color={palette.primary.light}
    anchorX="center"
    anchorY="middle"
  >
    {Math.round(score)}%
  </Text>
);

// Brand signature is rendered elsewhere in the scene; removed legacy in-file signature.

const FinancialHealthScene = ({ metrics, score }) => {
  const tokens = useThemeTokens();
  const { palette } = tokens;

  return (
    <group>
      <LightingRig />
      <BaseDisk palette={palette} />
      <Halo palette={palette} />
      <RadialHealthScore metrics={metrics} score={score} />
      <ScoreText score={score} palette={palette} />
      <Text position={[0, -1.2, 0]} fontSize={0.42} color={palette.text.secondary} anchorX="center">
        AI Financial Health
      </Text>
    </group>
  );
};

const BrandBackground = () => {
  const { palette } = useThemeTokens();
  return <color attach="background" args={[palette.canvas.base]} />;
};

const FallbackVisualization = ({ metrics, score }) => (
  <div className="flex flex-col items-center justify-center h-80 bg-canvas-light rounded-3xl border border-primary/20">
    <div className="text-6xl font-bold text-primary mb-4">
      {Math.round(score)}%
    </div>
    <div className="text-lg text-text-secondary mb-6">AI Financial Health</div>
    <div className="grid grid-cols-2 gap-4 w-full max-w-md px-6">
      {metrics.map((metric, i) => (
        <div key={i} className="text-center">
          <div className="text-sm text-text-secondary">{metric.label}</div>
          <div className={`text-xl font-bold ${
            metric.value > 80 ? 'text-success' : 
            metric.value < 60 ? 'text-danger' : 'text-primary'
          }`}>
            {Math.round(metric.value)}%
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FinancialHealthCanvas = ({ metrics, score }) => {
  const [webGLSupported, setWebGLSupported] = React.useState(true);

  React.useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!context) {
        setWebGLSupported(false);
      }
    } catch (e) {
      setWebGLSupported(false);
    }
  }, []);

  if (!webGLSupported) {
    return <FallbackVisualization metrics={metrics} score={score} />;
  }

  return (
    <div className="relative w-full h-80 rounded-3xl overflow-hidden">
      <Canvas 
        shadows 
        camera={{ position: [0, 4.5, 8], fov: 50 }}
        performance={{ min: 0.5 }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        <BrandBackground />
        <Suspense fallback={null}>
          <FinancialHealthScene metrics={metrics} score={score} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(Math.PI / 2) - 0.1}
          dampingFactor={0.12}
        />
      </Canvas>
    </div>
  );
};

export default FinancialHealthCanvas;
