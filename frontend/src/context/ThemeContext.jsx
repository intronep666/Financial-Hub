import React, { createContext, useContext, useMemo } from 'react';
import tokens from '../theme/tokens.json';

const ThemeContext = createContext(tokens);

export const ThemeProvider = ({ children }) => {
  const value = useMemo(() => tokens, []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeTokens = () => useContext(ThemeContext);

export default ThemeContext;
