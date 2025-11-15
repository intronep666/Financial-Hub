import React from 'react';
import { useThemeTokens } from '../context/ThemeContext';

const LightingRig = () => {
  const { palette } = useThemeTokens();

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.2}
        color={palette.text.primary}
      />
      <directionalLight
        position={[-8, 4, -6]}
        intensity={0.9}
        color={palette.primary.light}
      />
      <directionalLight
        position={[0, 6, -10]}
        intensity={0.7}
        color={palette.success.base}
      />
    </>
  );
};

export default LightingRig;
