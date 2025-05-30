// core/popup.js - Main popup controller (simplified)

/**
 * Main Popup Controller
 * Coordinates all components and handles initialization
 */
class PopupController {
  constructor() {
    this.video = null;
    this.canvas = null;
    this.trackingManager = null;
    this.themeManager = null;
    this.settingsUIManager = null;
  }

  /**
   * Initialize the popup interface
   */
  async initialize() {
    // Get DOM elements
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('output');
    
    if (!this.video || !this.canvas) {
      console.error('Required DOM elements not found');
      return;
    }

    // Set canvas dimensions to match container
    this.setCanvasDimensions();
    
    // Configure video element
    if (this.video) {
      window.CameraUtils.configureVideoElement(this.video);
    }      // Initialize components
    this.trackingManager = new window.TrackingManager(this.video, this.canvas);
    this.themeManager = new window.ThemeManager();
    this.settingsUIManager = new window.SettingsUIManager();
    
    // Initialize localization manager
    this.localizationManager = new window.LocalizationManager();
    
    // Make managers globally accessible for settings
    window.themeManager = this.themeManager;
    window.localizationManager = this.localizationManager;
    
    // Make statusManager globally accessible (it's created inside trackingManager)
    if (this.trackingManager.statusManager) {
      window.statusManager = this.trackingManager.statusManager;
    }
    
    // Initialize localization
    await this.localizationManager.initialize();
      // Initialize MediaPipe Hands
    await this.trackingManager.initializeHandTracking();
    
    // Ensure statusManager is globally accessible after initialization
    if (this.trackingManager.statusManager && !window.statusManager) {
      window.statusManager = this.trackingManager.statusManager;
      console.log('PopupController: StatusManager made globally accessible');
    }
    
    // Initialize settings UI
    await this.settingsUIManager.initializeSettingsUI();
    
    // Setup event handlers
    this.setupEventHandlers();
    
    console.log('Popup initialized - Auto-starting tracking...');
    
    // Auto-start tracking after initialization
    setTimeout(() => {
      if (!this.trackingManager.isTracking()) {
        this.trackingManager.startTracking();
      }
    }, 1000);
  }

  /**
   * Set canvas dimensions to match container
   */
  setCanvasDimensions() {
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer && this.canvas) {
      const containerWidth = videoContainer.offsetWidth;
      const containerHeight = videoContainer.offsetHeight;
      
      this.canvas.width = containerWidth;
      this.canvas.height = containerHeight;
      
      console.log(`Canvas dimensions set: ${containerWidth}x${containerHeight}`);
    }
  }
  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // Handle window resize to maintain canvas dimensions
    window.addEventListener('resize', () => {
      if (this.canvas) {
        this.setCanvasDimensions();
        console.log('Canvas resized on window resize');
      }
    });

    // Handle popup unload
    window.addEventListener('beforeunload', () => {
      if (this.trackingManager) {
        this.trackingManager.stopTracking();
        // Ensure cursor is removed
        window.Communication.sendCursorRemoval();
      }
    });
      // Handle visibility change (popup closed but extension still running)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        console.log('Popup hidden, removing cursor');
        if (this.trackingManager) {
          this.trackingManager.stopTracking();
          // Ensure cursor is removed with multiple attempts
          window.Communication.sendCursorRemoval();
          
          // Set up additional removal attempts in case the first one fails
          setTimeout(() => {
            if (document.visibilityState === 'hidden') {
              console.log('Additional cursor removal attempt');
              window.Communication.sendCursorRemoval();
            }
          }, 500);
        }
      }
    });
    
    // Additional check when the popup window loses focus
    window.addEventListener('blur', () => {
      console.log('Popup lost focus, ensuring cursor is removed');
      if (this.trackingManager) {
        this.trackingManager.stopTracking();
        window.Communication.sendCursorRemoval();
      }
    });
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
          window.TrackingManager &&
          window.ThemeManager &&
          window.SettingsUIManager &&
          window.StatusManager &&
          window.HandVisualization &&
          window.LocalizationManager) {
        console.log('All modules loaded successfully');
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    console.warn('Some modules may not be loaded yet');
    return false;
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  // Wait for all modules to load
  const popupController = new PopupController();
  
  // Make popup controller globally accessible
  window.popupController = popupController;
  
  await popupController.waitForModules();
  
  // Initialize the popup
  await popupController.initialize();
});

// Log initialization
console.log('Wavi Extension v2.0.0 - Modularized popup loaded');
