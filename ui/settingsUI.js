// ui/settingsUI.js - Settings panel UI management

/**
 * Settings UI Manager Module
 * Handles settings panel interactions and UI updates
 */
class SettingsUIManager {
  constructor() {
    this.settingsPanel = null;
    this.settingsOverlay = null;
    this.calibrationStatus = null;
  }

  /**
   * Initialize settings UI and event handlers
   */
  async initializeSettingsUI() {
    // Wait for modules to load
    await this.waitForModules();
    
    // Get DOM elements
    this.settingsPanel = document.getElementById('settingsPanel');
    this.settingsOverlay = document.getElementById('settingsOverlay');
    this.calibrationStatus = document.getElementById('calibrationStatus');
    
    if (!this.settingsPanel || !this.settingsOverlay) {
      console.error('Settings UI elements not found');
      return;
    }
    
    this.setupEventHandlers();
    this.loadSettings();
    
    console.log('Settings UI initialized');
  }

  /**
   * Setup all event handlers for settings UI
   */
  setupEventHandlers() {    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    const autoCalibrateBtn = document.getElementById('autoCalibrateBtn');
    const themeToggle = document.getElementById('themeToggle');
    const languageSelect = document.getElementById('languageSelect');
    
    // Event listeners
    settingsBtn?.addEventListener('click', () => this.openSettings());
    closeSettingsBtn?.addEventListener('click', () => this.closeSettings());
    
    // Close settings when clicking overlay
    this.settingsOverlay?.addEventListener('click', (event) => {
      if (event.target === this.settingsOverlay) {
        this.closeSettings();
      }
    });
    
    saveSettingsBtn?.addEventListener('click', () => this.saveSettings());
    resetSettingsBtn?.addEventListener('click', () => this.resetSettings());
    autoCalibrateBtn?.addEventListener('click', () => this.runAutoCalibration());
    
    // Theme toggle handled by ThemeManager
    if (window.themeManager) {
      themeToggle?.addEventListener('click', () => window.themeManager.toggleTheme());
    }
    
    // Language selector
    if (languageSelect && window.localizationManager) {
      languageSelect.addEventListener('change', (e) => this.handleLanguageChange(e));
    }
    
    // Preset buttons
    const presetButtons = document.querySelectorAll('.preset-card');
    presetButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handlePresetSelection(e));
      button.addEventListener('keydown', (e) => this.handlePresetKeydown(e));
    });
    
    // Slider inputs
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
      slider.addEventListener('input', (e) => this.handleSliderChange(e));
      slider.addEventListener('change', (e) => this.updateSliderValue(e));
    });
    
    // Checkbox inputs
    const checkboxes = document.querySelectorAll('.checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this.handleCheckboxChange(e));
    });
    
    // Keyboard navigation for settings panel
    this.settingsPanel.addEventListener('keydown', (e) => this.handleSettingsKeydown(e));
  }
  /**
   * Wait for required modules to load
   */
  async waitForModules() {
    const maxAttempts = 50;
    const delay = 100;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (window.Settings && 
          window.HandTracking && 
          window.GestureDetection && 
          window.Smoothing &&
          window.localizationManager) {
        console.log('All modules loaded successfully');
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    console.warn('Some modules may not be loaded yet');
    return false;
  }

  /**
   * Load current settings and populate UI
   */
  async loadSettings() {
    try {
      if (typeof window.Settings === 'undefined') {
        console.error('Settings module not loaded');
        return;
      }
      
      const settings = await window.Settings.getSettings();
      this.populateSettingsUI(settings);
      
    } catch (error) {
      console.error('Error loading settings:', error);
      this.showCalibrationStatus('Error loading settings', 'error');
    }
  }

  /**
   * Populate settings UI with current values
   */
  populateSettingsUI(settings) {
    // Hand tracking sensitivity
    this.updateSliderUI('xSensitivity', settings.movementSensitivity, 'x');
    this.updateSliderUI('ySensitivity', settings.yAxisSensitivityMultiplier, 'x');
    
    // Movement smoothing
    this.updateSliderUI('smoothingFactor', settings.smoothingFactor, '%', 100);
    this.updateSliderUI('movementThreshold', settings.movementThreshold, 'px', 1000);
    this.updateSliderUI('deadZoneRadius', settings.deadZoneRadius, 'px', 1000);
      // Gesture detection
    this.updateSliderUI('fistConfidence', settings.fistConfidenceThreshold, '%', 100);
    this.updateSliderUI('fistFrames', settings.requiredFistFrames, '');
    this.updateSliderUI('fistCooldown', settings.fistCooldown, 'ms');
    
    // Peace gesture settings
    this.updateCheckboxUI('peaceGestureEnabled', settings.peaceGestureEnabled);
    this.updateSliderUI('peaceConfidenceThreshold', settings.peaceConfidenceThreshold, '%', 100);
    this.updateSliderUI('peaceRequiredFrames', settings.peaceRequiredFrames, '');
    this.updateSliderUI('peaceCooldown', settings.peaceCooldown, 'ms');
    this.updateSliderUI('scrollSensitivity', settings.scrollSensitivity, 'x');
    this.updateSliderUI('minScrollInterval', settings.minScrollInterval, 'ms');
      // Accessibility options
    this.updateCheckboxUI('audioFeedback', settings.enableAudioFeedback);
    this.updateCheckboxUI('highContrast', settings.highContrast);
    this.updateCheckboxUI('reducedMotion', settings.reducedMotion);
    
    // Language selection
    this.updateLanguageUI(settings.language || 'nl');
    
    // Apply accessibility settings
    this.applyAccessibilitySettings({
      audioFeedback: settings.enableAudioFeedback,
      highContrast: settings.highContrast,
      reducedMotion: settings.reducedMotion
    });
    
    // Apply theme from settings
    if (window.themeManager) {
      window.themeManager.applyThemeFromSettings(settings);
    }
  }

  /**
   * Update slider UI element
   */
  updateSliderUI(sliderId, value, unit, multiplier = 1) {
    const slider = document.getElementById(sliderId);
    const valueSpan = document.getElementById(sliderId + 'Value');
    const descSpan = document.getElementById(sliderId.replace(/([A-Z])/g, '$1').toLowerCase() + 'Desc');
    
    if (slider) {
      slider.value = value;
      if (valueSpan) {
        const displayValue = Math.round(value * multiplier);
        valueSpan.textContent = displayValue + unit;
      }
      if (descSpan) {
        const displayValue = Math.round(value * multiplier);
        descSpan.textContent = `Current: ${displayValue}${unit} ${unit === '%' ? 'smoothing applied' : unit === 'ms' ? 'cooldown period' : unit === 'px' ? (sliderId.includes('threshold') ? 'minimum movement' : sliderId.includes('dead') ? 'dead zone radius' : '') : sliderId.includes('x') || sliderId.includes('y') ? 'normal speed' : ''}`;
      }
      
      // Update aria-valuetext
      const displayValue = Math.round(value * multiplier);
      slider.setAttribute('aria-valuetext', `${displayValue}${unit} ${unit === 'x' ? 'normal speed' : unit === '%' ? 'smoothing' : unit === 'px' ? 'pixels' : unit === 'ms' ? 'milliseconds' : unit === '' ? (sliderId.includes('frames') ? 'frames required' : '') : ''}`);
    }
  }
  /**
   * Update checkbox UI element
   */
  updateCheckboxUI(checkboxId, checked) {
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
      checkbox.checked = checked;
    }
  }

  /**
   * Update language UI element
   */
  updateLanguageUI(language) {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = language;
    }
  }

  /**
   * Open settings panel
   */
  openSettings() {
    this.settingsPanel.classList.add('active');
    this.settingsOverlay.classList.add('active');
    this.settingsPanel.setAttribute('aria-hidden', 'false');
    this.settingsOverlay.setAttribute('aria-hidden', 'false');
    
    // Focus the close button for keyboard navigation
    const closeBtn = document.getElementById('closeSettingsBtn');
    if (closeBtn) {
      closeBtn.focus();
    }
    
    // Trap focus within settings panel
    document.addEventListener('keydown', this.trapFocus);
  }

  /**
   * Close settings panel
   */
  closeSettings() {
    this.settingsPanel.classList.remove('active');
    this.settingsOverlay.classList.remove('active');
    this.settingsPanel.setAttribute('aria-hidden', 'true');
    this.settingsOverlay.setAttribute('aria-hidden', 'true');
    
    // Return focus to settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.focus();
    }
    
    // Remove focus trap
    document.removeEventListener('keydown', this.trapFocus);
  }

  /**
   * Handle preset selection
   */
  async handlePresetSelection(event) {
    const presetName = event.currentTarget.dataset.preset;
    if (!presetName) return;
    
    try {
      // Update radio group selection
      const presetButtons = document.querySelectorAll('.preset-card');
      presetButtons.forEach(button => {
        button.setAttribute('aria-checked', 'false');
        button.setAttribute('tabindex', '-1');
      });
      
      event.currentTarget.setAttribute('aria-checked', 'true');
      event.currentTarget.setAttribute('tabindex', '0');
      
      // Apply preset settings
      if (typeof window.Settings?.applyPreset === 'function') {
        await window.Settings.applyPreset(presetName);
        const newSettings = await window.Settings.getSettings();
        this.populateSettingsUI(newSettings);
        
        // Apply settings to modules
        await this.applySettingsToModules(newSettings);
        
        this.showCalibrationStatus(`Applied ${presetName} preset`, 'success');
      }
      
    } catch (error) {
      console.error('Error applying preset:', error);
      this.showCalibrationStatus('Error applying preset', 'error');
    }
  }

  /**
   * Handle preset keyboard navigation
   */
  handlePresetKeydown(event) {
    const presetButtons = Array.from(document.querySelectorAll('.preset-card'));
    const currentIndex = presetButtons.indexOf(event.currentTarget);
    
    let newIndex;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        newIndex = currentIndex > 0 ? currentIndex - 1 : presetButtons.length - 1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        newIndex = currentIndex < presetButtons.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.handlePresetSelection(event);
        return;
      default:
        return;
    }
    
    if (newIndex !== undefined) {
      event.preventDefault();
      presetButtons[newIndex].focus();
    }
  }

  /**
   * Handle slider value changes
   */
  handleSliderChange(event) {
    this.updateSliderValue(event);
    
    // Update settings via Settings module
    const sliderId = event.target.id;
    const value = parseFloat(event.target.value);
    
    this.updateSettingsValue(sliderId, value);
  }

  /**
   * Update slider display value
   */
  updateSliderValue(event) {
    const slider = event.target;
    const sliderId = slider.id;
    const value = parseFloat(slider.value);
    const valueSpan = document.getElementById(sliderId + 'Value');
    
    if (valueSpan) {
      let displayValue, unit;
        switch (sliderId) {
        case 'xSensitivity':
        case 'ySensitivity':
        case 'scrollSensitivity':
          displayValue = value.toFixed(1);
          unit = 'x';
          break;
        case 'smoothingFactor':
        case 'fistConfidence':
        case 'peaceConfidenceThreshold':
          displayValue = Math.round(value * 100);
          unit = '%';
          break;
        case 'movementThreshold':
        case 'deadZoneRadius':
          displayValue = Math.round(value * 1000);
          unit = 'px';
          break;
        case 'fistFrames':
        case 'peaceRequiredFrames':
          displayValue = Math.round(value);
          unit = '';
          break;
        case 'fistCooldown':
        case 'peaceCooldown':
        case 'minScrollInterval':
          displayValue = Math.round(value);
          unit = 'ms';
          break;
        default:
          displayValue = value;
          unit = '';
      }
      
      valueSpan.textContent = displayValue + unit;
      
      // Update aria-valuetext for accessibility
      slider.setAttribute('aria-valuetext', `${displayValue}${unit}`);
    }
  }

  /**
   * Update settings value from slider input
   */
  async updateSettingsValue(sliderId, value) {
    try {
      const updateObject = {};
      
      switch (sliderId) {
        case 'xSensitivity':
          updateObject.movementSensitivity = value;
          break;
        case 'ySensitivity':
          updateObject.yAxisSensitivityMultiplier = value;
          break;
        case 'smoothingFactor':
          updateObject.smoothingFactor = value;
          break;
        case 'movementThreshold':
          updateObject.movementThreshold = value;
          break;
        case 'deadZoneRadius':
          updateObject.deadZoneRadius = value;
          break;
        case 'fistConfidence':
          updateObject.fistConfidenceThreshold = value;
          break;
        case 'fistFrames':
          updateObject.requiredFistFrames = Math.round(value);
          break;        case 'fistCooldown':
          updateObject.fistCooldown = Math.round(value);
          break;
        case 'peaceConfidenceThreshold':
          updateObject.peaceConfidenceThreshold = value;
          break;
        case 'peaceRequiredFrames':
          updateObject.peaceRequiredFrames = Math.round(value);
          break;
        case 'peaceCooldown':
          updateObject.peaceCooldown = Math.round(value);
          break;
        case 'scrollSensitivity':
          updateObject.scrollSensitivity = value;
          break;
        case 'minScrollInterval':
          updateObject.minScrollInterval = Math.round(value);
          break;
      }
      
      if (Object.keys(updateObject).length > 0) {
        await window.Settings.updateSettings(updateObject);
      }
    } catch (error) {
      console.error('Error updating settings value:', error);
    }
  }

  /**
   * Handle checkbox changes
   */
  async handleCheckboxChange(event) {
    const checkboxId = event.target.id;
    const checked = event.target.checked;
    
    try {
      const updateObject = {};
        switch (checkboxId) {
        case 'audioFeedback':
          updateObject.enableAudioFeedback = checked;
          break;
        case 'highContrast':
          updateObject.highContrast = checked;
          this.applyHighContrast(checked);
          break;
        case 'reducedMotion':
          updateObject.reducedMotion = checked;
          this.applyReducedMotion(checked);
          break;
        case 'peaceGestureEnabled':
          updateObject.peaceGestureEnabled = checked;
          break;
      }
        if (Object.keys(updateObject).length > 0) {
        await window.Settings.updateSettings(updateObject);
      }
    } catch (error) {
      console.error('Error updating checkbox setting:', error);
    }
  }  /**
   * Handle language selection change
   */
  async handleLanguageChange(event) {
    const newLanguage = event.target.value;
    console.log(`SettingsUI: Language change initiated to ${newLanguage}`);
    
    try {
      // Update language setting
      await window.Settings.updateSettings({ language: newLanguage });
      console.log(`SettingsUI: Settings updated with language ${newLanguage}`);
      
      // Update localization
      if (window.localizationManager) {
        await window.localizationManager.setLanguage(newLanguage);
        console.log(`SettingsUI: Localization manager language set to ${newLanguage}`);
        
        window.localizationManager.updateUI();
        console.log(`SettingsUI: Localization UI updated`);
      } else {
        console.warn('SettingsUI: No localization manager found');
      }
        // Refresh status messages with new language
      if (window.statusManager) {
        console.log('SettingsUI: Calling status manager refresh');
        window.statusManager.refreshCurrentStatus();
      } else {
        console.warn('SettingsUI: No status manager found, doing direct element update');
        // Fallback: directly update status elements if statusManager is not available
        this.directStatusUpdate();
      }
      
      console.log(`Language changed to: ${newLanguage}`);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }

  /**
   * Apply accessibility settings
   */
  applyAccessibilitySettings(accessibility) {
    this.applyHighContrast(accessibility.highContrast);
    this.applyReducedMotion(accessibility.reducedMotion);
  }

  /**
   * Apply high contrast mode
   */
  applyHighContrast(enabled) {
    if (enabled) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }

  /**
   * Apply reduced motion preference
   */
  applyReducedMotion(enabled) {
    if (enabled) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  }

  /**
   * Save current settings
   */
  async saveSettings() {
    try {
      if (typeof window.Settings?.saveSettings === 'function') {
        await window.Settings.saveSettings();
        const settings = await window.Settings.getSettings();
        await this.applySettingsToModules(settings);
        this.showCalibrationStatus('Settings saved successfully', 'success');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showCalibrationStatus('Error saving settings', 'error');
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings() {
    try {
      if (typeof window.Settings?.resetSettings === 'function') {
        await window.Settings.resetSettings();
        const settings = await window.Settings.getSettings();
        this.populateSettingsUI(settings);
        await this.applySettingsToModules(settings);
        
        // Reset preset selection
        const presetButtons = document.querySelectorAll('.preset-card');
        presetButtons.forEach(button => {
          button.setAttribute('aria-checked', 'false');
          button.setAttribute('tabindex', '-1');
        });
        presetButtons[0]?.setAttribute('tabindex', '0');
        
        this.showCalibrationStatus('Settings reset to defaults', 'success');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      this.showCalibrationStatus('Error resetting settings', 'error');
    }
  }

  /**
   * Run auto-calibration
   */
  async runAutoCalibration() {
    try {
      const button = document.getElementById('autoCalibrateBtn');
      if (button) {
        button.disabled = true;
        button.textContent = 'Calibrating...';
      }
      
      this.showCalibrationStatus('Running auto-calibration...', 'info');
      
      if (typeof window.Settings?.startAutoCalibration === 'function') {
        await window.Settings.startAutoCalibration();
        const calibratedSettings = await window.Settings.getSettings();
        this.populateSettingsUI(calibratedSettings);
        await this.applySettingsToModules(calibratedSettings);
        
        this.showCalibrationStatus('Auto-calibration completed successfully', 'success');
      }
      
    } catch (error) {
      console.error('Error during auto-calibration:', error);
      this.showCalibrationStatus('Auto-calibration failed', 'error');
    } finally {
      const button = document.getElementById('autoCalibrateBtn');
      if (button) {
        button.disabled = false;
        button.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path><path d="M9 12l2 2 4-4"></path></svg>Run Auto-Calibration';
      }
    }
  }

  /**
   * Apply settings to all modules
   */
  async applySettingsToModules(settings) {
    try {
      // If no settings provided, get them from the Settings module
      if (!settings && window.Settings?.getSettings) {
        settings = await window.Settings.getSettings();
      }
      
      // Safety check - if still no settings, use defaults
      if (!settings) {
        console.warn('No settings available, using defaults');
        return;
      }
      
      // Apply to smoothing module
      if (typeof window.Smoothing?.updateSettings === 'function') {
        window.Smoothing.updateSettings({
          smoothingFactor: settings.smoothingFactor,
          movementThreshold: settings.movementThreshold,
          deadZoneRadius: settings.deadZoneRadius,
          enabled: true
        });
      }
        // Apply to gesture detection module
      if (typeof window.GestureDetection?.updateGestureSettings === 'function') {
        window.GestureDetection.updateGestureSettings({
          fistConfidenceThreshold: settings.fistConfidenceThreshold,
          requiredFistFrames: settings.requiredFistFrames,
          fistCooldown: settings.fistCooldown,
          minimumLockDuration: settings.minimumLockDuration || 150,
          peaceGestureEnabled: settings.peaceGestureEnabled,
          peaceConfidenceThreshold: settings.peaceConfidenceThreshold,
          peaceRequiredFrames: settings.peaceRequiredFrames,
          peaceCooldown: settings.peaceCooldown,
          scrollSensitivity: settings.scrollSensitivity,
          minScrollInterval: settings.minScrollInterval
        });
      }
      
      // Apply to hand tracking module
      if (typeof window.HandTracking?.updateSensitivitySettings === 'function') {
        window.HandTracking.updateSensitivitySettings({
          movementSensitivity: settings.movementSensitivity,
          yAxisSensitivityMultiplier: settings.yAxisSensitivityMultiplier
        });
      }
      
      console.log('Settings applied to all modules');
      
    } catch (error) {
      console.error('Error applying settings to modules:', error);
    }
  }

  /**
   * Show calibration status message
   */
  showCalibrationStatus(message, type = 'info') {
    if (this.calibrationStatus) {
      this.calibrationStatus.textContent = message;
      this.calibrationStatus.className = `calibration-status ${type}`;
      
      // Clear status after 3 seconds for success/info messages
      if (type === 'success' || type === 'info') {
        setTimeout(() => {
          this.calibrationStatus.textContent = '';
          this.calibrationStatus.className = 'calibration-status';
        }, 3000);
      }
    }
  }

  /**
   * Handle settings panel keyboard navigation
   */
  handleSettingsKeydown(event) {
    if (event.key === 'Escape') {
      this.closeSettings();
    }
  }

  /**
   * Trap focus within settings panel
   */
  trapFocus(event) {
    if (event.key === 'Tab') {
      const focusableElements = this.settingsPanel.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  /**
   * Direct status update fallback when statusManager is not available
   */
  directStatusUpdate() {
    if (!window.localizationManager) return;
    
    // Get status elements
    const statusText = document.getElementById('statusText');
    const statusLabel = document.querySelector('.status-label');
    const statusDot = document.getElementById('statusDot');
    
    if (!statusDot) return;
    
    // Determine current state from CSS classes
    let statusKey = 'stopped';
    let labelKey = 'trackingStopped';
    
    if (statusDot.classList.contains('active')) {
      statusKey = 'active';
      labelKey = 'trackingActive';
    } else if (statusDot.classList.contains('connecting')) {
      statusKey = 'startingCamera';
      labelKey = 'initializing';
    } else if (statusDot.classList.contains('error')) {
      statusKey = 'error';
      labelKey = 'error';
    }
    
    // Update status text elements directly
    if (statusText) {
      statusText.textContent = window.localizationManager.t(statusKey);
    }
    
    if (statusLabel) {
      statusLabel.textContent = window.localizationManager.t(labelKey);
    }
    
    console.log(`SettingsUI: Direct status update - ${statusKey} -> ${window.localizationManager.t(statusKey)}`);
  }
}

// Export for global access
window.SettingsUIManager = SettingsUIManager;
