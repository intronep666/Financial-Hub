import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';

import LightingRig from '../../scene/LightingRig';
import { useThemeTokens } from '../../context/ThemeContext';
import { useInteractionStore } from '../../context/InteractionStore';

const BAR_WIDTH = 1.2;

const GoalBar = ({ goal, index, palette }) => {
  const setSelectedGoal = useInteractionStore((state) => state.setSelectedGoal);
  const selectedGoalId = useInteractionStore((state) => state.selectedGoal?.id);
  const { actualProgress, forecastProgress, isOnTrack } = goal;
  const xPosition = index * (BAR_WIDTH + 0.8);
  const actualHeight = Math.max(0.2, actualProgress / 50);
  const forecastHeight = Math.max(0.2, forecastProgress / 50);
  const isSelected = selectedGoalId === goal.id;

  const actualSpring = useSpring({
    height: actualHeight,
    config: { tension: 130, friction: 24 },
  });

  const forecastSpring = useSpring({
    height: forecastHeight,
    config: { tension: 110, friction: 20 },
  });

  const selectionSpring = useSpring({
    scale: isSelected ? 1.08 : 1,
    lift: isSelected ? 0.15 : 0,
    glow: isSelected ? 0.4 : 0,
    config: { tension: 170, friction: 18 },
  });

  const actualColor = isOnTrack ? palette.success.base : palette.danger.base;
  const forecastColor = isOnTrack ? palette.success.light : palette.danger.light;

  const handleSelect = () => {
    setSelectedGoal(goal);
  };

  return (
    <a.group
      position={selectionSpring.lift.to((lift) => [xPosition, lift, 0])}
      scale={selectionSpring.scale.to((value) => [value, value, value])}
      onClick={handleSelect}
      onPointerOver={handleSelect}
    >
      <Text position={[0, -0.2, 0]} fontSize={0.32} color={isSelected ? palette.text.primary : palette.text.secondary} anchorX="center">
        {goal.name}
      </Text>

      <a.mesh position={[0, actualSpring.height.to((value) => value / 2), 0]} scale={[BAR_WIDTH, actualSpring.height, BAR_WIDTH]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <a.meshStandardMaterial
          color={actualColor}
          roughness={0.25}
          metalness={0.35}
          emissive={actualColor}
          emissiveIntensity={selectionSpring.glow}
        />
      </a.mesh>

      <a.mesh position={[0, forecastSpring.height.to((value) => value / 2 + 0.1), 0]} scale={[BAR_WIDTH * 0.92, forecastSpring.height, BAR_WIDTH * 0.92]}>
        <boxGeometry args={[1, 1, 1]} />
        <a.meshStandardMaterial
          color={forecastColor}
          transparent
          opacity={0.35}
          roughness={0.15}
          emissive={forecastColor}
          emissiveIntensity={selectionSpring.glow.to((value) => value * 0.6)}
        />
      </a.mesh>

      <Text position={[0, actualHeight + 0.3, 0]} fontSize={0.28} color={palette.text.primary} anchorX="center">
        {actualProgress.toFixed(1)}%
      </Text>
    </a.group>
  );
};

const GoalsSpatialField = ({ data }) => {
  const { palette } = useThemeTokens();
  const spacingOffset = -((data.length - 1) * (BAR_WIDTH + 0.8)) / 2;

  return (
    <group position={[spacingOffset, 0, 0]}>
      <LightingRig />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[data.length * 1.5 || 3, data.length * 1.5 || 3, 0.2, 80]} />
        <meshStandardMaterial color={palette.canvas.light} roughness={0.45} metalness={0.15} />
      </mesh>
      {data.map((goal, index) => (
        <GoalBar key={goal.id} goal={goal} index={index} palette={palette} />
      ))}
    </group>
  );
};

const GoalsSpatial = ({ goals }) => {
  const { palette } = useThemeTokens();
  const data = useMemo(() => goals, [goals]);

  if (!data.length) {
    return null;
  }

  return (
    <div className="glass-card p-0 overflow-hidden">
      <div className="h-72">
        <Canvas shadows camera={{ position: [0, 4, 8], fov: 55 }}>
          <color attach="background" args={[palette.canvas.base]} />
          <Suspense fallback={null}>
            <GoalsSpatialField data={data} />
          </Suspense>
          <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 4} maxPolarAngle={(Math.PI / 2) - 0.12} />
        </Canvas>
      </div>
    </div>
  );
};

export default GoalsSpatial;
