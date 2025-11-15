import React, { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';

import { useThemeTokens } from '../../context/ThemeContext';

const FACTORS = [
  'Income',
  'Spending Control',
  'Savings Rate',
  'Debt-to-Asset',
  'Goal Progress',
];

const clamp = (v) => Math.max(0, Math.min(100, v));

const RadialHealthScore = ({ metrics = [], score = 0 }) => {
  const { camera } = useThree();
  const { palette } = useThemeTokens();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(null);
  const [pointerPos, setPointerPos] = useState([0, 0]);

  const segments = useMemo(() => {
    const data = FACTORS.map((label, i) => {
      const m = metrics[i] || { label, value: 0 };
      const value = clamp(typeof m.value === 'number' ? m.value : m.value ?? 0);
      return { label: m.label || label, value, insight: m.insight || '' };
    });

    const radius = 2.6;
    return data.map((d, i) => {
      const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      return { ...d, angle, position: [x, 0, z], rotationY: -angle };
    });
  }, [metrics]);

  useFrame(() => {
    if (!groupRef.current) return;
    // subtle rotation for spatial arc
    groupRef.current.rotation.y = Math.sin(Date.now() * 0.0006) * 0.03;
  });

  return (
    <group ref={groupRef} position={[0, 0.1, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <cylinderGeometry args={[3, 3, 0.08, 24]} />
        <meshLambertMaterial color={palette.canvas.light} />
      </mesh>

      {segments.map((seg, idx) => (
        <RadialBar
          key={seg.label}
          seg={seg}
          idx={idx}
          palette={palette}
          setHovered={setHovered}
          setPointerPos={setPointerPos}
          hovered={hovered}
          pointerPos={pointerPos}
          camera={camera}
        />
      ))}

      <group position={[0, 1.05, 0]}>
        <mesh>
          <cylinderGeometry args={[0.9, 0.9, 0.32, 24]} />
          <meshLambertMaterial color={palette.canvas.base} />
        </mesh>

        <Text
          position={[0, 0.18, 0]}
          fontSize={0.9}
          color={palette.primary.light}
          anchorX="center"
          anchorY="middle"
        >
          {Math.round(clamp(score))}%
        </Text>

        <Text position={[0, -0.5, 0]} fontSize={0.22} color={palette.text.secondary} anchorX="center">
          AI Financial Health
        </Text>
      </group>
    </group>
  );
};

function RadialBar({ seg, idx, palette, setHovered, setPointerPos, hovered, pointerPos, camera }) {
  const height = 0.25 + (seg.value / 100) * 2.3;
  const color = seg.value > 80 ? palette.success.base : seg.value < 60 ? palette.danger.base : palette.primary.base;

  const spring = useSpring({
    scale: [1, height, 1],
    config: { mass: 1, tension: 140, friction: 20 },
  });

  return (
    <a.group
      position={[seg.position[0], height / 2 - 0.12, seg.position[2]]}
      rotation={[0, seg.rotationY, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(idx);
        setPointerPos([e.clientX, e.clientY]);
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        setPointerPos([e.clientX, e.clientY]);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(null);
      }}
      castShadow
    >
      <a.mesh scale={spring.scale}>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshLambertMaterial color={color} emissive={palette.canvas.base} />
      </a.mesh>

      <Label
        text={seg.label}
        value={seg.value}
        insight={seg.insight}
        palette={palette}
        camera={camera}
        showTooltip={hovered === idx}
        pointerPos={pointerPos}
      />
    </a.group>
  );
}

function Label({ text, value, insight, palette, camera, showTooltip, pointerPos }) {
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;
    const camPos = camera.position.clone();
    ref.current.lookAt(camPos);
    ref.current.rotation.z = 0;
  });

  return (
    <group>
      <group ref={ref} position={[0, 0.6, 0]} rotation={[0, 0, 0]}>
        <Text fontSize={0.16} color={palette.text.primary} anchorX="center" anchorY="bottom">
          {text}
        </Text>
        <Text position={[0, -0.12, 0]} fontSize={0.14} color={palette.text.secondary} anchorX="center" anchorY="top">
          {value}%
        </Text>
      </group>

      {showTooltip && (
        <group position={[0, 1.2, 0]}>
          <mesh>
            <planeGeometry args={[2.5, 1]} />
            <meshBasicMaterial color={palette.canvas.base} transparent opacity={0.9} />
          </mesh>
          <Text 
            position={[0, 0.2, 0.01]} 
            fontSize={0.12} 
            color={palette.text.primary} 
            anchorX="center"
            anchorY="middle"
            maxWidth={2.2}
          >
            {text}: {value}%
          </Text>
          <Text 
            position={[0, -0.1, 0.01]} 
            fontSize={0.08} 
            color={palette.text.secondary} 
            anchorX="center"
            anchorY="middle"
            maxWidth={2.2}
          >
            {insight || 'No insights available'}
          </Text>
        </group>
      )}
    </group>
  );
}

export default RadialHealthScore;
