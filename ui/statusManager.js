// ui/statusManager.js - Status and UI state management

/**
 * Status Manager Module
 * Handles UI status updates and state management
 */
class StatusManager {
  constructor() {
    this.statusElements = this.getStatusElements();
  }

  /**
   * Get all status-related DOM elements
   */
  getStatusElements() {
    return {
      statusDot: document.getElementById('statusDot'),
      statusText: document.getElementById('statusText'),
      cameraStatus: document.getElementById('cameraStatus'),
      cameraOverlay: document.getElementById('cameraStatus')?.parentElement,
      statusPill: document.querySelector('.status-pill'),
      statusLabel: document.querySelector('.status-label')
    };
  }

  /**
   * Update UI based on tracking state
   * @param {string} state - Current state ('starting', 'tracking', 'stopped', 'error')
   * @param {string} message - Optional message for error state
   */
  updateUI(state, message = '') {
    const { 
      statusDot, 
      statusText, 
      cameraStatus, 
      cameraOverlay, 
      statusPill, 
      statusLabel 
    } = this.statusElements;
    
    switch (state) {
      case 'starting':
        this.updateStartingState(statusDot, statusText, cameraOverlay, cameraStatus, statusPill, statusLabel);
        break;
        
      case 'tracking':
        this.updateTrackingState(statusDot, statusText, cameraOverlay, statusPill, statusLabel);
        break;
        
      case 'stopped':
        this.updateStoppedState(statusDot, statusText, cameraOverlay, cameraStatus, statusPill, statusLabel);
        break;
        
      case 'error':
        this.updateErrorState(statusDot, statusText, cameraOverlay, cameraStatus, statusPill, statusLabel, message);
        break;
    }
  }
  /**
   * Update UI for starting state
   */
  updateStartingState(statusDot, statusText, cameraOverlay, cameraStatus, statusPill, statusLabel) {
    // Header status
    if (statusDot) {
      statusDot.className = 'status-dot connecting';
    }
    if (statusText) {
      statusText.textContent = window.localizationManager ? window.localizationManager.t('startingCamera') : 'Starting...';
    }
    
    // Camera overlay
    if (cameraOverlay) {
      cameraOverlay.classList.remove('hidden');
    }
    if (cameraStatus) {
      const startingText = window.localizationManager ? window.localizationManager.t('startingCamera') : 'Starting camera...';
      cameraStatus.innerHTML = `<div class="loading-spinner"></div><span>${startingText}</span>`;
    }
    
    // Footer status pill
    if (statusPill) {
      statusPill.className = 'status-pill';
    }
    if (statusLabel) {
      statusLabel.textContent = window.localizationManager ? window.localizationManager.t('initializing') : 'Initializing';
    }
  }
  /**
   * Update UI for tracking state
   */
  updateTrackingState(statusDot, statusText, cameraOverlay, statusPill, statusLabel) {
    // Header status
    if (statusDot) {
      statusDot.className = 'status-dot active';
    }
    if (statusText) {
      statusText.textContent = window.localizationManager ? window.localizationManager.t('active') : 'Active';
    }
    
    // Camera overlay
    if (cameraOverlay) {
      cameraOverlay.classList.add('hidden');
    }
    
    // Footer status pill
    if (statusPill) {
      statusPill.className = 'status-pill active';
    }
    if (statusLabel) {
      statusLabel.textContent = window.localizationManager ? window.localizationManager.t('trackingActive') : 'Tracking Active';
    }
  }
  /**
   * Update UI for stopped state
   */
  updateStoppedState(statusDot, statusText, cameraOverlay, cameraStatus, statusPill, statusLabel) {
    // Header status
    if (statusDot) {
      statusDot.className = 'status-dot';
    }
    if (statusText) {
      statusText.textContent = window.localizationManager ? window.localizationManager.t('stopped') : 'Stopped';
    }
    
    // Camera overlay
    if (cameraOverlay) {
      cameraOverlay.classList.remove('hidden');
    }
    if (cameraStatus) {
      const stoppedText = window.localizationManager ? window.localizationManager.t('trackingStopped') : 'Tracking stopped';
      cameraStatus.innerHTML = `<span>${stoppedText}</span>`;
    }
    
    // Footer status pill
    if (statusPill) {
      statusPill.className = 'status-pill';
    }
    if (statusLabel) {
      statusLabel.textContent = window.localizationManager ? window.localizationManager.t('trackingStopped') : 'Tracking Stopped';
    }
  }  /**
   * Update UI for error state
   */
  updateErrorState(statusDot, statusText, cameraOverlay, cameraStatus, statusPill, statusLabel, message) {
    // Header status
    if (statusDot) {
      statusDot.className = 'status-dot error';
    }
    if (statusText) {
      statusText.textContent = window.localizationManager ? window.localizationManager.t('error') : 'Error';
    }
    
    // Camera overlay
    if (cameraOverlay) {
      cameraOverlay.classList.remove('hidden');
    }
    if (cameraStatus) {
      const errorText = message || (window.localizationManager ? window.localizationManager.t('errorOccurred') : 'Error occurred');
      cameraStatus.innerHTML = `<span>${errorText}</span>`;
    }
    
    // Footer status pill
    if (statusPill) {
      statusPill.className = 'status-pill error';
    }
    if (statusLabel) {
      statusLabel.textContent = window.localizationManager ? window.localizationManager.t('error') : 'Error';
    }
  }
  /**
   * Refresh current status with new language
   * This method re-applies the current state with updated translations
   */
  refreshCurrentStatus() {
    // Get current state from UI elements
    const { statusDot, statusPill } = this.statusElements;
    
    if (!statusDot) {
      console.log('StatusManager: No status dot found for refresh');
      return;
    }
    
    // Determine current state from CSS classes
    let currentState = 'stopped'; // default
    if (statusDot.classList.contains('active')) {
      currentState = 'tracking';
    } else if (statusDot.classList.contains('connecting')) {
      currentState = 'starting';
    } else if (statusDot.classList.contains('error')) {
      currentState = 'error';
    }
    
    console.log(`StatusManager: Refreshing status - detected state: ${currentState}, classes: ${statusDot.className}`);
    
    // Re-apply the current state to refresh with new translations
    this.updateUI(currentState);
  }
}

// Export for global access
window.StatusManager = StatusManager;
