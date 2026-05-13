import React, { createContext, useContext, useState, useEffect } from 'react';

const THEMES = {
  indigo: {
    name: 'Corporate Blue',
    accent: '#6366f1',
    accentLight: '#818cf8',
    accentDark: '#4f46e5',
    accentGlow: 'rgba(99, 102, 241, 0.25)',
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7)',
  },
  ocean: {
    name: 'Tech Azure',
    accent: '#0ea5e9',
    accentLight: '#38bdf8',
    accentDark: '#0284c7',
    accentGlow: 'rgba(14, 165, 233, 0.25)',
    gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
  },
  emerald: {
    name: 'Success Green',
    accent: '#10b981',
    accentLight: '#34d399',
    accentDark: '#059669',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
  },
  rose: {
    name: 'Priority Crimson',
    accent: '#f43f5e',
    accentLight: '#fb7185',
    accentDark: '#e11d48',
    accentGlow: 'rgba(244, 63, 94, 0.25)',
    gradient: 'linear-gradient(135deg, #f43f5e, #ec4899)',
  },
  amber: {
    name: 'Warning Gold',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    accentDark: '#d97706',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  },
  violet: {
    name: 'Innovation Purple',
    accent: '#8b5cf6',
    accentLight: '#a78bfa',
    accentDark: '#7c3aed',
    accentGlow: 'rgba(139, 92, 246, 0.25)',
    gradient: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem('colorTheme') || 'indigo';
  });

  // Apply dark/light mode
  useEffect(() => {
    const root = window.document.body;
    if (isDarkMode) {
      root.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Apply color theme CSS variables
  useEffect(() => {
    const theme = THEMES[colorTheme] || THEMES.indigo;
    const root = document.documentElement;
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-light', theme.accentLight);
    root.style.setProperty('--accent-dark', theme.accentDark);
    root.style.setProperty('--accent-glow', theme.accentGlow);
    root.style.setProperty('--accent-gradient', theme.gradient);
    localStorage.setItem('colorTheme', colorTheme);

    // Update body data attribute for CSS selectors
    document.body.setAttribute('data-color-theme', colorTheme);
  }, [colorTheme]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const changeColorTheme = (themeKey) => {
    if (THEMES[themeKey]) {
      setColorTheme(themeKey);
    }
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleTheme,
      colorTheme,
      changeColorTheme,
      themes: THEMES,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
