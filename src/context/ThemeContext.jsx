import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('semaphore_admin_theme_v2');
      if (savedTheme) {
        return savedTheme;
      }
    } catch (e) {
      console.warn(e);
    }
    return 'light';
  });

  const [colorPreset, setColorPreset] = useState(() => {
    try {
      return localStorage.getItem('semaphore_admin_color_preset_v2') || 'indigo';
    } catch (e) {
      return 'indigo';
    }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-color', colorPreset);
      localStorage.setItem('semaphore_admin_theme_v2', theme);
      localStorage.setItem('semaphore_admin_color_preset_v2', colorPreset);
    } catch (e) {
      console.warn(e);
    }
  }, [theme, colorPreset]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const changeColorPreset = (preset) => {
    setColorPreset(preset);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, colorPreset, changeColorPreset }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
