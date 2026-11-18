import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('fitlife_theme') || 'dark');
  const [unit, setUnit] = useState(() => localStorage.getItem('fitlife_unit') || 'metric'); // 'metric' or 'imperial'

  useEffect(() => {
    localStorage.setItem('fitlife_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fitlife_unit', unit);
  }, [unit]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleUnit = () => {
    setUnit(prev => (prev === 'metric' ? 'imperial' : 'metric'));
  };

  // Measurement unit conversion helpers
  const formatWeight = (kg) => {
    if (kg === undefined || kg === null || isNaN(kg)) return '--';
    if (unit === 'imperial') {
      const lbs = Math.round(kg * 2.20462 * 10) / 10;
      return `${lbs} lbs`;
    }
    return `${kg} kg`;
  };

  const formatHeight = (cm) => {
    if (cm === undefined || cm === null || isNaN(cm)) return '--';
    if (unit === 'imperial') {
      const totalInches = cm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}'${inches}"`;
    }
    return `${cm} cm`;
  };

  const formatDistance = (km) => {
    if (km === undefined || km === null || isNaN(km)) return '--';
    if (unit === 'imperial') {
      const miles = Math.round(km * 0.621371 * 10) / 10;
      return `${miles} mi`;
    }
    return `${km} km`;
  };

  const formatWater = (ml) => {
    if (ml === undefined || ml === null || isNaN(ml)) return '--';
    if (unit === 'imperial') {
      const oz = Math.round(ml * 0.033814);
      return `${oz} fl oz`;
    }
    return ml >= 1000 ? `${(ml / 1000).toFixed(1)} L` : `${ml} ml`;
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      unit,
      setUnit,
      toggleUnit,
      formatWeight,
      formatHeight,
      formatDistance,
      formatWater
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
