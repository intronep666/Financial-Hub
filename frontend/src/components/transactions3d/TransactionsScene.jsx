import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

import LightingRig from '../../scene/LightingRig';
import { useThemeTokens } from '../../context/ThemeContext';
import { useInteractionStore } from '../../context/InteractionStore';

const DISTRIBUTION_RADIUS = 4.5;

const aggregateTransactions = (transactions) => {
  const map = new Map();

  transactions.forEach((transaction) => {
    const key = transaction.category?.name || 'Uncategorised';
    const entry = map.get(key) || { total: 0, count: 0, type: transaction.type, category: transaction.category };
    const amount = Number(transaction.amount) || 0;
    entry.total += amount;
    entry.count += 1;
    entry.type = transaction.type;
    entry.category = transaction.category;
    map.set(key, entry);
  });

  return Array.from(map.entries()).map(([name, value]) => ({
    name,
    ...value,
  }));
};

const InstancedTransactionField = ({ data, palette }) => {
  const meshRef = useRef();
  const setSelectedTransactionCategory = useInteractionStore((state) => state.setSelectedTransactionCategory);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    if (!meshRef.current) return;

    data.forEach((item, index) => {
      const angle = (index / data.length) * Math.PI * 2;
      const radius = DISTRIBUTION_RADIUS * (0.7 + (item.count / Math.max(data.length, 1)) * 0.3);
      const yOffset = Math.min(2.8, Math.max(0.4, item.total / 2500));

      tempObject.position.set(
        Math.cos(angle) * radius,
        yOffset / 2,
        Math.sin(angle) * radius
      );
      tempObject.rotation.set(0, angle, 0);
      tempObject.scale.setScalar(Math.min(1.8, 0.7 + Math.cbrt(item.total / 1000)));
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(index, tempObject.matrix);

      const colorSource = item.type === 'income' ? palette.success.light : palette.danger.light;
      meshRef.current.setColorAt(index, tempColor.set(colorSource));
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [data, palette, tempColor, tempObject]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.35;
    }
  });

  const handlePointerDown = (event) => {
    event.stopPropagation();
    const index = event.instanceId ?? 0;
    const payload = data[index];
    if (payload) {
      setSelectedTransactionCategory({
        name: payload.name,
        total: payload.total,
        count: payload.count,
        type: payload.type,
      });
      if (navigator.vibrate) {
        navigator.vibrate(35);
      }
    }
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, data.length || 1]}
      castShadow
      receiveShadow
      onPointerDown={handlePointerDown}
    >
      <sphereGeometry args={[0.6, 48, 48]} />
      <meshStandardMaterial roughness={0.2} metalness={0.25} transparent opacity={0.9} />
    </instancedMesh>
  );
};

const SelectionCaption = ({ palette }) => {
  const selection = useInteractionStore((state) => state.selectedTransactionCategory);

  if (!selection) return null;

  return (
    <Text position={[0, 4.2, 0]} fontSize={0.5} color={palette.text.primary} anchorX="center">
      {selection.name}: ₹{selection.total.toFixed(2)}
    </Text>
  );
};

const TransactionsField = ({ data }) => {
  const { palette } = useThemeTokens();

  return (
    <group>
      <LightingRig />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.15, 0]}>
        <cylinderGeometry args={[6, 6, 0.2, 80]} />
        <meshStandardMaterial color={palette.canvas.light} roughness={0.4} metalness={0.2} />
      </mesh>
      <InstancedTransactionField data={data} palette={palette} />
      <SelectionCaption palette={palette} />
    </group>
  );
};

const TransactionsScene = ({ transactions }) => {
  const aggregated = useMemo(() => aggregateTransactions(transactions), [transactions]);

  return (
    <div className="glass-card p-0 overflow-hidden">
      <div className="h-72">
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 55 }}>
          <color attach="background" args={[ '#101019' ]} />
          <Suspense fallback={null}>
            <TransactionsField data={aggregated} />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={(Math.PI / 2) - 0.15} />
        </Canvas>
      </div>
    </div>
  );
};

export default TransactionsScene;
