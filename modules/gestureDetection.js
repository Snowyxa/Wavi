// gestureDetection.js - Fist gesture detection and processing
// This module handles the core fist gesture detection for clicking

// Gesture detection state variables
let fistConfidence = 0;
let fistConfidenceThreshold = 0.7;
let consecutiveFistFrames = 0;
let requiredFistFrames = 3;
let lastFistState = false;
let fistCooldown = false;
let fistCooldownTimeout = null;
let fistCooldownDuration = 500; // Configurable cooldown duration

// Gesture stabilization variables
let isPositionLocked = false;
let lockedPosition = null;
let gestureStabilizationTimeout = null;
let fistDetectionStartTime = null;
let minimumLockDuration = 150; // Minimum time to lock cursor during fist (ms)

/**
 * Detect fist gesture using hand landmarks
 * @param {Array} landmarks - Hand landmarks from MediaPipe
 * @returns {boolean} - True if fist is detected
 */
function detectFistGesture(landmarks) {
  let fistScore = 0;
  
  // Check thumb position (landmark 4)
  const thumbTip = landmarks[4];
  const thumbMCP = landmarks[2];
  if (thumbTip.y > thumbMCP.y) {
    fistScore += 0.2; // Thumb is down/closed
  }
  
  // Check finger positions (tips vs MCPs)
  const fingerPairs = [
    [8, 5],  // Index finger
    [12, 9], // Middle finger
    [16, 13], // Ring finger
    [20, 17]  // Pinky finger
  ];
  
  for (const [tipIndex, mcpIndex] of fingerPairs) {
    if (landmarks[tipIndex].y > landmarks[mcpIndex].y) {
      fistScore += 0.2; // Finger is bent/closed
    }
  }
  
  return fistScore >= fistConfidenceThreshold;
}

/**
 * Process fist gesture detection with confidence tracking
 * @param {Array} landmarks - Hand landmarks from MediaPipe
 * @returns {boolean} - True if stable fist gesture is detected
 */
function processFistDetection(landmarks) {
  const currentFist = detectFistGesture(landmarks);
  
  if (currentFist) {
    fistConfidence = Math.min(1.0, fistConfidence + 0.3);
    consecutiveFistFrames++;
  } else {
    fistConfidence = Math.max(0.0, fistConfidence - 0.1);
    consecutiveFistFrames = Math.max(0, consecutiveFistFrames - 1);
  }
  
  return consecutiveFistFrames >= requiredFistFrames && fistConfidence > 0.6;
}

/**
 * Handle gesture state changes for clicking
 * @param {boolean} gestureDetected - Current gesture state
 * @param {Object} centerPosition - Current cursor position
 * @param {Function} onClickCallback - Callback function for click events
 */
function handleGestureStateChange(gestureDetected, centerPosition, onClickCallback) {
  if (gestureDetected !== lastFistState && !fistCooldown) {
    lastFistState = gestureDetected;
    
    if (gestureDetected) {
      // Fist detected - lock cursor position
      isPositionLocked = true;
      lockedPosition = {
        x: centerPosition.x,
        y: centerPosition.y
      };
      fistDetectionStartTime = Date.now();
      
      console.log('Fist gesture detected - locking cursor at position:', lockedPosition);
      
      // Trigger click event
      if (onClickCallback) {
        onClickCallback(lockedPosition.x, lockedPosition.y);
      }
      
      // Set cooldown to prevent multiple clicks
      fistCooldown = true;
      if (fistCooldownTimeout) {
        clearTimeout(fistCooldownTimeout);
      }      fistCooldownTimeout = setTimeout(() => {
        fistCooldown = false;
      }, fistCooldownDuration); // Configurable cooldown between clicks
    } else {
      // Fist released - unlock cursor after minimum duration
      const gestureDuration = fistDetectionStartTime ? Date.now() - fistDetectionStartTime : 0;
      const unlockDelay = Math.max(0, minimumLockDuration - gestureDuration);
      
      if (gestureStabilizationTimeout) {
        clearTimeout(gestureStabilizationTimeout);
      }
      
      gestureStabilizationTimeout = setTimeout(() => {
        isPositionLocked = false;
        lockedPosition = null;
        fistDetectionStartTime = null;
        console.log('Cursor position unlocked - movement enabled');
      }, unlockDelay);
    }
  }
}

/**
 * Reset gesture detection state
 */
function resetGestureState() {
  fistConfidence = 0;
  consecutiveFistFrames = 0;
  lastFistState = false;
  fistCooldown = false;
  
  // Clear timeouts
  if (fistCooldownTimeout) {
    clearTimeout(fistCooldownTimeout);
    fistCooldownTimeout = null;
  }
  
  if (gestureStabilizationTimeout) {
    clearTimeout(gestureStabilizationTimeout);
    gestureStabilizationTimeout = null;
  }
  
  // Reset position locking
  isPositionLocked = false;
  lockedPosition = null;
  fistDetectionStartTime = null;
}

/**
 * Check if cursor position is currently locked due to gesture
 * @returns {boolean} - True if position is locked
 */
function isPositionCurrentlyLocked() {
  return isPositionLocked;
}

/**
 * Get the locked cursor position
 * @returns {Object|null} - Locked position object or null
 */
function getLockedPosition() {
  return lockedPosition;
}

/**
 * Update gesture detection settings
 * @param {Object} settings - New gesture settings
 */
function updateGestureSettings(settings) {
  if (settings.fistConfidenceThreshold !== undefined) {
    fistConfidenceThreshold = Math.max(0.3, Math.min(0.95, settings.fistConfidenceThreshold));
  }
  
  if (settings.requiredFistFrames !== undefined) {
    requiredFistFrames = Math.max(1, Math.min(10, settings.requiredFistFrames));
  }
  
  if (settings.fistCooldown !== undefined) {
    // Update the cooldown value, but don't interrupt current cooldown
    const newCooldown = Math.max(100, Math.min(2000, settings.fistCooldown));
    // Update for next cooldown cycle
    fistCooldownDuration = newCooldown;
  }
  
  if (settings.minimumLockDuration !== undefined) {
    minimumLockDuration = Math.max(50, Math.min(500, settings.minimumLockDuration));
  }
  
  console.log('Gesture detection settings updated:', {
    fistConfidenceThreshold,
    requiredFistFrames,
    fistCooldownDuration: settings.fistCooldown,
    minimumLockDuration
  });
}

/**
 * Get current gesture settings
 * @returns {Object} - Current gesture settings
 */
function getGestureSettings() {
  return {
    fistConfidenceThreshold,
    requiredFistFrames,
    fistCooldown: fistCooldownDuration || 500,
    minimumLockDuration
  };
}

// Export functions for use in other modules
window.GestureDetection = {
  processFistDetection,
  handleGestureStateChange,
  resetGestureState,
  isPositionCurrentlyLocked,
  getLockedPosition,
  updateGestureSettings,
  getGestureSettings
};
