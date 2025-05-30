// handTracking.js - Core hand tracking and cursor control logic
// This module handles MediaPipe hand tracking and cursor position calculations

// Core tracking state
let hands = null;
let isTracking = false;
let lastValidPosition = null;
let isHandVisible = false;
let lastHandPosition = null;
let centerPosition = null;
let isFirstHandDetection = true;

// Movement and sensitivity settings
let movementSensitivity = 1.5; // Reduced for smoother movement
let yAxisSensitivityMultiplier = 1.2; // Y-axis sensitivity multiplier
let resolutionScaleFactor = 1.0; // Scaling factor for movement sensitivity based on resolution
let tabDimensions = { width: 1920, height: 1080 }; // Store actual tab dimensions

/**
 * Initialize MediaPipe Hands with error handling
 */
async function initializeMediaPipeHands() {
  try {
    if (typeof Hands === 'undefined') {
      throw new Error('MediaPipe Hands library not loaded');
    }
    
    // Initialize with explicit locateFile function
    hands = new Hands({
      locateFile: (file) => {
        const basePath = window.MediaPipeBasePath || './lib/';
        const fullPath = basePath + file;
        console.log('MediaPipe requesting file:', file, '-> Full path:', fullPath);
        return fullPath;
      }
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5
    });

    console.log('MediaPipe Hands initialized successfully');
    return hands;
  } catch (error) {
    console.error('Failed to initialize MediaPipe Hands:', error);
    return null;
  }
}

/**
 * Start hand tracking
 * @param {HTMLVideoElement} videoElement - Video element for input
 * @param {HTMLCanvasElement} canvasElement - Canvas element for output
 * @param {Function} onResultsCallback - Callback for processing results
 */
function startHandTracking(videoElement, canvasElement, onResultsCallback) {
  if (!hands) {
    throw new Error('MediaPipe Hands not initialized');
  }

  hands.onResults(onResultsCallback);
  
  // Get actual container dimensions instead of hardcoded values
  const videoContainer = videoElement.parentElement;
  const containerWidth = videoContainer ? videoContainer.offsetWidth : 1280;
  const containerHeight = videoContainer ? videoContainer.offsetHeight : 720;
  
  console.log(`Starting camera with dimensions: ${containerWidth}x${containerHeight}`);
  
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      if (isTracking) {
        await hands.send({ image: videoElement });
      }
    },
    width: containerWidth,
    height: containerHeight
  });

  camera.start();
  isTracking = true;
  
  console.log('Hand tracking started with container-based dimensions');
  return camera;
}

/**
 * Stop hand tracking
 */
function stopHandTracking() {
  isTracking = false;
  
  // Reset tracking state
  isHandVisible = false;
  lastValidPosition = null;
  lastHandPosition = null;
  centerPosition = null;
  isFirstHandDetection = true;
  
  console.log('Hand tracking stopped');
}

/**
 * Map value from one range to another
 * @param {number} value - Input value
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum  
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} - Mapped value
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Calculate cursor position from hand landmarks
 * @param {Array} landmarks - Hand landmarks from MediaPipe
 * @returns {Object} - Cursor position {x, y}
 */
function calculateCursorPosition(landmarks) {
  const indexFinger = landmarks[8]; // Index finger tip
  
  if (!indexFinger) return null;
  
  // Handle first hand detection
  if (isFirstHandDetection) {
    try {
      // Map the initial hand position to current cursor position to prevent jumps
      centerPosition = {
        x: mapRange(indexFinger.x, 0.2, 0.8, tabDimensions.width * 0.2, tabDimensions.width * 0.8),
        y: mapRange(indexFinger.y, 0.2, 0.8, tabDimensions.height * 0.2, tabDimensions.height * 0.8)
      };
      
      console.log(`First hand detection: x=${indexFinger.x.toFixed(4)}, y=${indexFinger.y.toFixed(4)}`);
      console.log(`Center position set to: x=${centerPosition.x}, y=${centerPosition.y}`);
      console.log(`Tab dimensions: ${tabDimensions.width}x${tabDimensions.height}`);
      
      isFirstHandDetection = false;
      lastHandPosition = { x: indexFinger.x, y: indexFinger.y };
      
      return centerPosition;
    } catch (error) {
      console.error('Error during first hand detection:', error);
      return null;
    }
  }
  
  // Calculate relative movement for subsequent frames
  if (lastHandPosition && centerPosition) {
    const currentHandPosition = {
      x: indexFinger.x,
      y: indexFinger.y
    };
    
    // Apply smoothing to hand position
    const smoothedHandPosition = window.Smoothing.applySmoothingToMovement(currentHandPosition, lastHandPosition);
      // Calculate movement delta with flipped X axis using smoothed position
    const deltaX = -1 * (smoothedHandPosition.x - lastHandPosition.x) * movementSensitivity;
    
    // For Y axis: MediaPipe coordinates are 0 (top) to 1 (bottom)
    // We want natural movement: hand moves down -> cursor moves down
    // Use the configurable Y-axis sensitivity multiplier
    const deltaY = (smoothedHandPosition.y - lastHandPosition.y) * movementSensitivity * yAxisSensitivityMultiplier;
    
    // Calculate new cursor position
    const newCursorPosition = {
      x: centerPosition.x + deltaX * tabDimensions.width,
      y: centerPosition.y + deltaY * tabDimensions.height
    };
    
    // Apply additional smoothing to cursor position
    const smoothedCursorPosition = window.Smoothing.calculateSmoothedPosition(newCursorPosition);
    
    // Update center position with smoothed cursor position
    centerPosition.x = smoothedCursorPosition.x;
    centerPosition.y = smoothedCursorPosition.y;
    
    // Update last hand position
    lastHandPosition = smoothedHandPosition;
    
    // Debug logging (reduced for performance)
    if (Math.random() < 0.1) { // Log only 10% of frames
      console.log(`Hand movement: delta(${deltaX.toFixed(4)}, ${deltaY.toFixed(4)}), cursor(${centerPosition.x.toFixed(0)}, ${centerPosition.y.toFixed(0)})`);
    }
    
    return centerPosition;
  }
  
  return null;
}

/**
 * Update tab dimensions for cursor calculations
 * @param {Object} dimensions - New tab dimensions {width, height}
 */
function updateTabDimensions(dimensions) {
  tabDimensions = dimensions;
  
  // Update resolution scale factor
  resolutionScaleFactor = Math.min(dimensions.width / 1920, dimensions.height / 1080);
  console.log(`Tab dimensions updated: ${dimensions.width}x${dimensions.height}, scale factor: ${resolutionScaleFactor.toFixed(2)}`);
}

/**
 * Reset hand tracking state
 */
function resetTrackingState() {
  isHandVisible = false;
  lastValidPosition = null;
  lastHandPosition = null;
  centerPosition = null;
  isFirstHandDetection = true;
  
  // Reset gesture detection state
  if (window.GestureDetection) {
    window.GestureDetection.resetGestureState();
  }
  
  // Reset smoothing state
  if (window.Smoothing) {
    window.Smoothing.resetSmoothingState();
  }
  
  console.log('Hand tracking state reset');
}

/**
 * Check if hand is currently visible
 * @returns {boolean} - Hand visibility status
 */
function isHandCurrentlyVisible() {
  return isHandVisible;
}

/**
 * Set hand visibility status
 * @param {boolean} visible - New visibility status
 */
function setHandVisibility(visible) {
  isHandVisible = visible;
}

/**
 * Get current cursor position
 * @returns {Object|null} - Current cursor position or null
 */
function getCurrentCursorPosition() {
  return centerPosition;
}

/**
 * Get current tracking status
 * @returns {boolean} - Whether tracking is currently active
 */
function isCurrentlyTracking() {
  return isTracking;
}

/**
 * Update sensitivity settings
 * @param {Object} settings - New sensitivity settings
 */
function updateSensitivitySettings(settings) {
  if (settings.movementSensitivity !== undefined) {
    movementSensitivity = Math.max(0.1, Math.min(5.0, settings.movementSensitivity));
  }
  
  if (settings.yAxisSensitivityMultiplier !== undefined) {
    yAxisSensitivityMultiplier = Math.max(0.5, Math.min(3.0, settings.yAxisSensitivityMultiplier));
  }
  
  console.log('Hand tracking sensitivity updated:', {
    movementSensitivity,
    yAxisSensitivityMultiplier
  });
}

/**
 * Get current sensitivity settings
 * @returns {Object} - Current sensitivity settings
 */
function getSensitivitySettings() {
  return {
    movementSensitivity,
    yAxisSensitivityMultiplier
  };
}

// Export functions for use in other modules
window.HandTracking = {
  initializeMediaPipeHands,
  startHandTracking,
  stopHandTracking,
  calculateCursorPosition,
  updateTabDimensions,
  resetTrackingState,
  isHandCurrentlyVisible,
  setHandVisibility,
  getCurrentCursorPosition,
  isCurrentlyTracking,
  mapRange,
  updateSensitivitySettings,
  getSensitivitySettings
};
