// theme.js - Manages theme switching for Wavi extension

/**
 * Initialize theme functionality
 */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  const lightIcon = document.getElementById('lightIcon');
  const darkIcon = document.getElementById('darkIcon');
  
  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem('waviTheme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  // Apply the current theme
  applyTheme(currentTheme);
  
  // Set up toggle button state
  if (themeToggle && themeLabel) {
    if (currentTheme === 'dark') {
      lightIcon.style.display = 'none';
      darkIcon.style.display = 'inline';
      themeLabel.textContent = 'Dark Mode';
    } else {
      lightIcon.style.display = 'inline';
      darkIcon.style.display = 'none';
      themeLabel.textContent = 'Light Mode';
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
      const newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
      applyTheme(newTheme);
      
      // Update button appearance
      if (newTheme === 'dark') {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'inline';
        themeLabel.textContent = 'Dark Mode';
      } else {
        lightIcon.style.display = 'inline';
        darkIcon.style.display = 'none';
        themeLabel.textContent = 'Light Mode';
      }
      
      // Save preference
      localStorage.setItem('waviTheme', newTheme);
    });
  }
}

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

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', initTheme);
