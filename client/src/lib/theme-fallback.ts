// Theme configuration fallback for production
// This ensures consistent UI across local, Replit, and Render deployments
export const defaultTheme = {
  variant: "professional",
  primary: "hsl(221, 83%, 53%)", // Blue-600 for BizSuite branding
  appearance: "light",
  radius: 0.5
};

// Fallback theme provider for when Replit plugins are not available
// Works in both development and production (Render)
export function getThemeConfig() {
  try {
    // Try to load theme from Replit plugin if available (works on Replit)
    if (typeof window !== 'undefined') {
      // Check for Replit theme (Replit environment)
      if ((window as any).__REPLIT_THEME__) {
        const theme = (window as any).__REPLIT_THEME__;
        console.log('✅ Using Replit theme');
        return theme;
      }
      
      // Check for theme in localStorage (for custom overrides)
      const storedTheme = localStorage.getItem('app-theme');
      if (storedTheme) {
        try {
          const parsed = JSON.parse(storedTheme);
          console.log('✅ Using stored theme');
          return { ...defaultTheme, ...parsed };
        } catch (e) {
          // Invalid stored theme, use default
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  Theme detection failed, using default:', error);
  }
  
  // Default theme for Render and local development
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
