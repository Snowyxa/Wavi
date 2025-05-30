// settings.js - Settings and calibration management
// This module handles user settings persistence and calibration functionality

// Default settings configuration
const DEFAULT_SETTINGS = {
  // Cursor movement sensitivity
  movementSensitivity: 1.5,
  yAxisSensitivityMultiplier: 1.2,
  
  // Smoothing settings
  smoothingFactor: 0.7,
  movementThreshold: 0.005,
  deadZoneRadius: 0.003,
  velocitySmoothing: 0.8,
  
  // Gesture detection settings
  fistConfidenceThreshold: 0.7,
  requiredFistFrames: 3,
  fistCooldown: 500,
  minimumLockDuration: 150,
  
  // Accessibility settings
  enableVisualFeedback: true,
  enableAudioFeedback: false,
  reducedMotion: false,
  highContrast: false,
  
  // Theme settings
  theme: 'auto', // 'light', 'dark', or 'auto'
  
  // Version for settings migration
  settingsVersion: '1.0.0'
};

// Current settings state
let currentSettings = { ...DEFAULT_SETTINGS };
let settingsLoaded = false;

/**
 * Load settings from Chrome storage
 * @returns {Promise<Object>} - Promise resolving to loaded settings
 */
async function loadSettings() {
  try {
    // Check if we're in an extension context
    const isExtensionContext = typeof chrome !== 'undefined' && 
                             chrome.runtime && 
                             chrome.runtime.id;
    
    if (isExtensionContext && chrome.storage && chrome.storage.sync) {
      try {
        const result = await chrome.storage.sync.get(['waviSettings']);
        const savedSettings = result.waviSettings;
        
        if (savedSettings && savedSettings.settingsVersion) {
          // Merge saved settings with defaults to handle new settings
          currentSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
          console.log('Settings loaded from Chrome storage:', currentSettings);
        } else {
          // First time use or migration needed
          currentSettings = { ...DEFAULT_SETTINGS };
          await saveSettings(); // Save defaults
          console.log('Default settings applied and saved to Chrome storage');
        }
      } catch (chromeError) {
        console.warn('Chrome storage failed, falling back to localStorage:', chromeError);
        loadFromLocalStorage();
      }
    } else {
      // Fallback for non-extension contexts or when Chrome storage is unavailable
      loadFromLocalStorage();
    }
    
    settingsLoaded = true;
    
    // Apply settings to modules
    applySettingsToModules();
      return currentSettings;
  } catch (error) {
    console.error('Failed to load settings:', error);
    currentSettings = { ...DEFAULT_SETTINGS };
    settingsLoaded = true;
    return currentSettings;
  }
}

/**
 * Load settings from localStorage (fallback method)
 */
function loadFromLocalStorage() {
  try {
    const savedSettings = localStorage.getItem('waviSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
      console.log('Settings loaded from localStorage:', currentSettings);
    } else {
      currentSettings = { ...DEFAULT_SETTINGS };
      // Save defaults to localStorage
      localStorage.setItem('waviSettings', JSON.stringify(currentSettings));
      console.log('Default settings applied and saved to localStorage');
    }
  } catch (e) {
    console.warn('Failed to parse localStorage settings, using defaults:', e);
    currentSettings = { ...DEFAULT_SETTINGS };
  }
}

/**
 * Save settings to Chrome storage
 * @returns {Promise<void>} - Promise resolving when settings are saved
 */
async function saveSettings() {
  try {
    // Check if we're in an extension context
    const isExtensionContext = typeof chrome !== 'undefined' && 
                             chrome.runtime && 
                             chrome.runtime.id;
    
    if (isExtensionContext && chrome.storage && chrome.storage.sync) {
      try {
        await chrome.storage.sync.set({
          waviSettings: currentSettings
        });
        console.log('Settings saved to Chrome storage');
      } catch (chromeError) {
        console.warn('Chrome storage save failed, falling back to localStorage:', chromeError);
        localStorage.setItem('waviSettings', JSON.stringify(currentSettings));
        console.log('Settings saved to localStorage (fallback)');
      }
    } else {
      // Fallback for non-extension contexts
      localStorage.setItem('waviSettings', JSON.stringify(currentSettings));
      console.log('Settings saved to localStorage');
    }
    
    // Apply settings to modules immediately
    applySettingsToModules();
    
    // Dispatch settings change event
    window.dispatchEvent(new CustomEvent('waviSettingsChanged', {
      detail: currentSettings
    }));
    
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Update specific settings
 * @param {Object} newSettings - Settings to update
 * @returns {Promise<void>} - Promise resolving when settings are updated
 */
async function updateSettings(newSettings) {
  // Validate and sanitize settings
  const validatedSettings = validateSettings(newSettings);
  
  // Merge with current settings
  currentSettings = { ...currentSettings, ...validatedSettings };
  
  // Save to storage
  await saveSettings();
  
  console.log('Settings updated:', validatedSettings);
}

/**
 * Reset settings to defaults
 * @returns {Promise<void>} - Promise resolving when settings are reset
 */
async function resetSettings() {
  currentSettings = { ...DEFAULT_SETTINGS };
  await saveSettings();
  console.log('Settings reset to defaults');
}

/**
 * Get current settings
 * @returns {Object} - Current settings object
 */
function getSettings() {
  return { ...currentSettings };
}

/**
 * Get specific setting value
 * @param {string} key - Setting key
 * @returns {*} - Setting value
 */
function getSetting(key) {
  return currentSettings[key];
}

/**
 * Validate settings values
 * @param {Object} settings - Settings object to validate
 * @returns {Object} - Validated settings
 */
function validateSettings(settings) {
  const validated = {};
  
  // Movement sensitivity validation
  if (settings.movementSensitivity !== undefined) {
    validated.movementSensitivity = Math.max(0.1, Math.min(5.0, Number(settings.movementSensitivity)));
  }
  
  if (settings.yAxisSensitivityMultiplier !== undefined) {
    validated.yAxisSensitivityMultiplier = Math.max(0.5, Math.min(3.0, Number(settings.yAxisSensitivityMultiplier)));
  }
  
  // Smoothing validation
  if (settings.smoothingFactor !== undefined) {
    validated.smoothingFactor = Math.max(0.1, Math.min(0.9, Number(settings.smoothingFactor)));
  }
  
  if (settings.movementThreshold !== undefined) {
    validated.movementThreshold = Math.max(0.001, Math.min(0.02, Number(settings.movementThreshold)));
  }
  
  if (settings.deadZoneRadius !== undefined) {
    validated.deadZoneRadius = Math.max(0.001, Math.min(0.01, Number(settings.deadZoneRadius)));
  }
  
  if (settings.velocitySmoothing !== undefined) {
    validated.velocitySmoothing = Math.max(0.1, Math.min(0.9, Number(settings.velocitySmoothing)));
  }
  
  // Gesture detection validation
  if (settings.fistConfidenceThreshold !== undefined) {
    validated.fistConfidenceThreshold = Math.max(0.3, Math.min(0.95, Number(settings.fistConfidenceThreshold)));
  }
  
  if (settings.requiredFistFrames !== undefined) {
    validated.requiredFistFrames = Math.max(1, Math.min(10, Number(settings.requiredFistFrames)));
  }
  
  if (settings.fistCooldown !== undefined) {
    validated.fistCooldown = Math.max(100, Math.min(2000, Number(settings.fistCooldown)));
  }
  
  if (settings.minimumLockDuration !== undefined) {
    validated.minimumLockDuration = Math.max(50, Math.min(500, Number(settings.minimumLockDuration)));
  }
  
  // Boolean settings
  ['enableVisualFeedback', 'enableAudioFeedback', 'reducedMotion', 'highContrast'].forEach(key => {
    if (settings[key] !== undefined) {
      validated[key] = Boolean(settings[key]);
    }
  });
  
  return validated;
}

/**
 * Apply current settings to other modules
 */
function applySettingsToModules() {
  if (!settingsLoaded) return;
  
  // Apply smoothing settings
  if (window.Smoothing && typeof window.Smoothing.updateSmoothingSettings === 'function') {
    window.Smoothing.updateSmoothingSettings({
      smoothingFactor: currentSettings.smoothingFactor,
      movementThreshold: currentSettings.movementThreshold,
      deadZoneRadius: currentSettings.deadZoneRadius,
      enabled: true
    });
  }
  
  // Apply hand tracking settings (movement sensitivity is handled in handTracking.js)
  if (window.HandTracking && typeof window.HandTracking.updateSensitivitySettings === 'function') {
    window.HandTracking.updateSensitivitySettings({
      movementSensitivity: currentSettings.movementSensitivity,
      yAxisSensitivityMultiplier: currentSettings.yAxisSensitivityMultiplier
    });
  }
  
  // Apply gesture detection settings
  if (window.GestureDetection && typeof window.GestureDetection.updateGestureSettings === 'function') {
    window.GestureDetection.updateGestureSettings({
      fistConfidenceThreshold: currentSettings.fistConfidenceThreshold,
      requiredFistFrames: currentSettings.requiredFistFrames,
      fistCooldown: currentSettings.fistCooldown,
      minimumLockDuration: currentSettings.minimumLockDuration
    });
  }
  
  console.log('Settings applied to modules');
}

/**
 * Start auto-calibration process
 * @returns {Promise<Object>} - Promise resolving to calibration results
 */
async function startAutoCalibration() {
  try {
    console.log('Starting auto-calibration...');
    
    // Auto-calibration logic would analyze user's hand movement patterns
    // For now, we'll use adaptive defaults based on screen size
    const screenArea = screen.width * screen.height;
    const baseResolution = 1920 * 1080;
    const resolutionFactor = Math.sqrt(screenArea / baseResolution);
    
    const calibratedSettings = {
      movementSensitivity: Math.max(0.5, Math.min(3.0, 1.5 * resolutionFactor)),
      smoothingFactor: resolutionFactor > 1.5 ? 0.8 : 0.7, // More smoothing on high-res displays
      deadZoneRadius: resolutionFactor > 1.5 ? 0.004 : 0.003
    };
    
    await updateSettings(calibratedSettings);
    
    console.log('Auto-calibration completed:', calibratedSettings);
    return calibratedSettings;
    
  } catch (error) {
    console.error('Auto-calibration failed:', error);
    throw error;
  }
}

/**
 * Get accessibility-friendly setting descriptions
 * @returns {Object} - Setting descriptions for screen readers
 */
function getSettingDescriptions() {
  return {
    movementSensitivity: 'Controls how much the cursor moves in response to hand movement. Higher values make the cursor more responsive.',
    yAxisSensitivityMultiplier: 'Adjusts vertical movement sensitivity. Values above 1.0 make vertical movement more responsive.',
    smoothingFactor: 'Controls cursor movement smoothness. Higher values reduce jitter but may feel less responsive.',
    movementThreshold: 'Minimum hand movement required to move the cursor. Higher values ignore smaller movements.',
    deadZoneRadius: 'Size of the area around the cursor where small movements are ignored.',
    fistConfidenceThreshold: 'How confident the system must be that you are making a fist before triggering a click.',
    requiredFistFrames: 'Number of consecutive frames a fist must be detected before triggering a click.',
    fistCooldown: 'Minimum time between clicks in milliseconds to prevent accidental double-clicks.',
    enableVisualFeedback: 'Show visual indicators when gestures are detected.',
    enableAudioFeedback: 'Play sounds when gestures are detected.',
    reducedMotion: 'Reduce animations and motion effects for users who prefer less movement.',
    highContrast: 'Use high contrast colors for better visibility.'
  };
}

/**
 * Export preset configurations for different use cases
 * @returns {Object} - Available preset configurations
 */
function getPresetConfigurations() {
  return {
    'high-precision': {
      name: 'High Precision',
      description: 'Slower but more precise cursor control for detailed work',
      settings: {
        movementSensitivity: 0.8,
        smoothingFactor: 0.8,
        movementThreshold: 0.003,
        deadZoneRadius: 0.002,
        fistConfidenceThreshold: 0.8,
        requiredFistFrames: 4
      }
    },
    'responsive': {
      name: 'Responsive',
      description: 'Fast and responsive cursor control for general use',
      settings: {
        movementSensitivity: 2.0,
        smoothingFactor: 0.6,
        movementThreshold: 0.007,
        deadZoneRadius: 0.004,
        fistConfidenceThreshold: 0.6,
        requiredFistFrames: 2
      }
    },
    'accessibility': {
      name: 'Accessibility Optimized',
      description: 'Optimized for users with motor impairments',
      settings: {
        movementSensitivity: 1.2,
        smoothingFactor: 0.8,
        movementThreshold: 0.008,
        deadZoneRadius: 0.005,
        fistConfidenceThreshold: 0.7,
        requiredFistFrames: 4,
        fistCooldown: 800,
        enableVisualFeedback: true,
        enableAudioFeedback: true
      }
    },
    'gaming': {
      name: 'Gaming',
      description: 'Fast response optimized for gaming and interactive content',
      settings: {
        movementSensitivity: 2.5,
        smoothingFactor: 0.5,
        movementThreshold: 0.004,
        deadZoneRadius: 0.002,
        fistConfidenceThreshold: 0.6,
        requiredFistFrames: 2,
        fistCooldown: 300
      }
    }
  };
}

/**
 * Apply a preset configuration
 * @param {string} presetName - Name of the preset to apply
 * @returns {Promise<void>} - Promise resolving when preset is applied
 */
async function applyPreset(presetName) {
  const presets = getPresetConfigurations();
  const preset = presets[presetName];
  
  if (!preset) {
    throw new Error(`Unknown preset: ${presetName}`);
  }
  
  await updateSettings(preset.settings);
  console.log(`Applied preset: ${preset.name}`);
}

// Initialize settings on module load
loadSettings().catch(error => {
  console.error('Failed to initialize settings:', error);
});

// Export functions for use in other modules
window.Settings = {
  loadSettings,
  saveSettings,
  updateSettings,
  resetSettings,
  getSettings,
  getSetting,
  startAutoCalibration,
  getSettingDescriptions,
  getPresetConfigurations,
  applyPreset,
  validateSettings,
  DEFAULT_SETTINGS
};
