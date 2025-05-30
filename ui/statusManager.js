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
      statusText.textContent = 'Starting...';
    }
    
    // Camera overlay
    if (cameraOverlay) {
      cameraOverlay.classList.remove('hidden');
    }
    if (cameraStatus) {
      cameraStatus.innerHTML = '<div class="loading-spinner"></div><span>Starting camera...</span>';
    }
    
    // Footer status pill
    if (statusPill) {
      statusPill.className = 'status-pill';
    }
    if (statusLabel) {
      statusLabel.textContent = 'Initializing';
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
      statusText.textContent = 'Active';
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
      statusLabel.textContent = 'Tracking Active';
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
      statusText.textContent = 'Stopped';
    }
    
    // Camera overlay
    if (cameraOverlay) {
      cameraOverlay.classList.remove('hidden');
    }
    if (cameraStatus) {
      cameraStatus.innerHTML = '<span>Tracking stopped</span>';
    }
    
    // Footer status pill
    if (statusPill) {
      statusPill.className = 'status-pill';
    }
    if (statusLabel) {
      statusLabel.textContent = 'Tracking Stopped';
    }
  }

  /**
   * Update UI for error state
   */
  updateErrorState(statusDot, statusText, cameraOverlay, cameraStatus, statusPill, statusLabel, message) {
    // Header status
    if (statusDot) {
      statusDot.className = 'status-dot error';
    }
    if (statusText) {
      statusText.textContent = 'Error';
    }
    
    // Camera overlay
    if (cameraOverlay) {
      cameraOverlay.classList.remove('hidden');
    }
    if (cameraStatus) {
      cameraStatus.innerHTML = `<span>${message || 'Error occurred'}</span>`;
    }
    
    // Footer status pill
    if (statusPill) {
      statusPill.className = 'status-pill error';
    }
    if (statusLabel) {
      statusLabel.textContent = 'Error';
    }
  }
}

// Export for global access
window.StatusManager = StatusManager;
