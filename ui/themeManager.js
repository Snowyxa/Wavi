// ui/themeManager.js - Theme management functionality

/**
 * Theme Manager Module
 * Handles light/dark theme switching and initialization
 */
class ThemeManager {
  constructor() {
    this.initializeTheme();
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    console.log(`Toggling theme from ${currentTheme} to ${newTheme}`);
    console.log('Body classes before:', document.body.className);
    
    // Update body class with explicit class management
    if (newTheme === 'dark') {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
    
    console.log('Body classes after:', document.body.className);
    
    // Force a repaint to ensure styles are applied
    document.body.offsetHeight;
    
    // Update theme toggle UI
    this.updateThemeToggleUI(newTheme);
    
    // Save theme preference
    localStorage.setItem('waviTheme', newTheme);
    
    // Update settings if available - don't call saveSettings directly
    try {
      if (window.Settings && typeof window.Settings.updateSettings === 'function') {
        // Only update the theme setting, don't trigger a full settings application
        const themeUpdate = { theme: newTheme };
        window.Settings.updateSettings(themeUpdate);
        console.log('Theme updated to:', newTheme);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }

  /**
   * Initialize theme based on saved preference
   */
  initializeTheme() {
    try {
      const savedTheme = localStorage.getItem('waviTheme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Determine the effective theme
      let currentTheme;
      if (savedTheme && savedTheme !== 'auto') {
        currentTheme = savedTheme;
      } else {
        // Use system preference for 'auto' or when no preference is saved
        currentTheme = prefersDark ? 'dark' : 'light';
      }
      
      // Apply theme with explicit class management
      if (currentTheme === 'dark') {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
      }
      
      // Update theme toggle UI elements
      this.updateThemeToggleUI(currentTheme);
      
      console.log('Theme initialized:', currentTheme, '(saved theme was:', savedTheme, ')');
      console.log('Body classes:', document.body.className);
    } catch (error) {
      console.error('Error initializing theme:', error);
    }
  }

  /**
   * Update theme toggle UI elements
   */
  updateThemeToggleUI(theme) {
    const lightIcon = document.getElementById('lightIcon');
    const darkIcon = document.getElementById('darkIcon');
    const themeLabel = document.getElementById('themeLabel');
    
    if (lightIcon && darkIcon && themeLabel) {
      if (theme === 'dark') {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'inline';
        themeLabel.textContent = 'Dark Mode';
      } else {
        lightIcon.style.display = 'inline';
        darkIcon.style.display = 'none';
        themeLabel.textContent = 'Light Mode';
      }
      console.log(`UI updated for ${theme} theme`);
    } else {
      console.warn('Theme toggle UI elements not found');
    }
  }

  /**
   * Apply theme from settings (called during settings load)
   */
  applyThemeFromSettings(settings) {
    const savedTheme = settings.theme || 'auto';
    let effectiveTheme;
    
    if (savedTheme === 'auto') {
      // Use system preference for auto theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    } else {
      effectiveTheme = savedTheme;
    }
    
    // Only apply theme if it's different from current state to avoid overriding user toggles
    const isCurrentlyDark = document.body.classList.contains('dark-theme');
    const shouldBeDark = effectiveTheme === 'dark';
    
    if (isCurrentlyDark !== shouldBeDark) {
      if (effectiveTheme === 'dark') {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
      }
    }
    
    // Update theme toggle UI
    this.updateThemeToggleUI(effectiveTheme);
  }
}

// Export for global access
window.ThemeManager = ThemeManager;
