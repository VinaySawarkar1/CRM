// Theme configuration fallback for production
export const defaultTheme = {
  variant: "professional",
  primary: "hsl(0, 100%, 25%)",
  appearance: "light",
  radius: 0.5
};

// Fallback theme provider for when Replit plugins are not available
export function getThemeConfig() {
  try {
    // Try to load theme from Replit plugin if available
    if (typeof window !== 'undefined' && (window as any).__REPLIT_THEME__) {
      return (window as any).__REPLIT_THEME__;
    }
  } catch (error) {
    console.log('Replit theme not available, using default theme');
  }
  
  return defaultTheme;
}

// CSS variables for theme
export function applyTheme(theme = defaultTheme) {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--radius', `${theme.radius}rem`);
  
  if (theme.appearance === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
