// theme.js - Basic theme utilities for Wavi extension
// Note: Theme toggle is managed by popup.js to avoid conflicts

/**
 * Apply theme to document
 * @param {string} theme - 'light' or 'dark'
 */
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

// Export to global scope for use by other modules
window.applyTheme = applyTheme;
