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

// Peace sign scroll detection state variables
let peaceConfidence = 0;
let peaceConfidenceThreshold = 0.7;
let consecutivePeaceFrames = 0;
let requiredPeaceFrames = 3;
let lastPeaceState = false;
let peaceCooldown = false;
let peaceCooldownTimeout = null;
let peaceCooldownDuration = 300; // Shorter cooldown for scroll
let lastPeaceDirection = null;
let peaceScrollDirection = null; // 'up' or 'down'

// Add a holder for current peace settings, including minScrollInterval
let currentPeaceSettings = {
  peaceGestureEnabled: true,
  peaceConfidenceThreshold: 0.7,
  requiredPeaceFrames: 3,
  peaceCooldown: 300, // This is the cooldown *between distinct gesture sequences*
  scrollSensitivity: 1.0,
  minScrollInterval: 100, // This is the cooldown *between continuous scroll ticks*
  scrollDirectionThreshold: 0.05 // New setting for up/down detection sensitivity
};

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
 * Detect peace sign (victory) gesture using hand landmarks
 * @param {Array} landmarks - Hand landmarks from MediaPipe
 * @returns {Object} - Object with detected status and direction {detected: boolean, direction: string}
 */
function detectPeaceGesture(landmarks) {
  let peaceScore = 0;
  const wrist = landmarks[0];
  const indexTipLandmark = landmarks[8];
  const middleTipLandmark = landmarks[12];
  const thumbTip = landmarks[4];
  const thumbMCP = landmarks[2];
  const indexMCPLandmark = landmarks[5];
  const middleMCPLandmark = landmarks[9]; // This is also middle finger MCP
  const ringTip = landmarks[16];
  const ringMCP = landmarks[13];
  const pinkyTip = landmarks[20];
  const pinkyMCP = landmarks[17];

  // Determine overall hand orientation for finger checks
  // handInverted is true if the hand is likely pointing downwards (e.g., for scroll down)
  const handInverted = middleMCPLandmark.y > wrist.y;

  // Check thumb position (should be closed/down)
  // For inverted hand, "closed" means thumb tip Y < thumb MCP Y
  if (handInverted ? (thumbTip.y < thumbMCP.y) : (thumbTip.y > thumbMCP.y)) {
    peaceScore += 0.25; // Thumb is closed
  }
  
  // Check index finger (should be extended/up)
  // For inverted hand, "extended" means index tip Y > index MCP Y
  if (handInverted ? (indexTipLandmark.y > indexMCPLandmark.y) : (indexTipLandmark.y < indexMCPLandmark.y)) {
    peaceScore += 0.25; // Index finger is extended
  }
  
  // Check middle finger (should be extended/up)
  // For inverted hand, "extended" means middle tip Y > middle MCP Y
  if (handInverted ? (middleTipLandmark.y > middleMCPLandmark.y) : (middleTipLandmark.y < middleMCPLandmark.y)) {
    peaceScore += 0.25; // Middle finger is extended
  }
  
  // Check ring finger (should be closed/down)
  // For inverted hand, "closed" means ring tip Y < ring MCP Y
  if (handInverted ? (ringTip.y < ringMCP.y) : (ringTip.y > ringMCP.y)) {
    peaceScore += 0.125; // Ring finger is closed
  }
  
  // Check pinky finger (should be closed/down)
  // For inverted hand, "closed" means pinky tip Y < pinky MCP Y
  if (handInverted ? (pinkyTip.y < pinkyMCP.y) : (pinkyTip.y > pinkyMCP.y)) {
    peaceScore += 0.125; // Pinky finger is closed
  }
  
  const isPeaceSignClear = peaceScore >= currentPeaceSettings.peaceConfidenceThreshold;
  let determinedScrollDirection = null;

  if (isPeaceSignClear) {
    console.log(`Peace Sign DETECTED (Score: ${peaceScore.toFixed(3)}, Form: ${handInverted ? 'Inverted' : 'Upright'}). Wrist.y: ${wrist.y.toFixed(3)}, IndexTip.y: ${indexTipLandmark.y.toFixed(3)}, ScrollThreshold: ${currentPeaceSettings.scrollDirectionThreshold}`);

    if (!handInverted) { // Attempting an UPRIGHT peace sign
      if (indexTipLandmark.y < wrist.y - currentPeaceSettings.scrollDirectionThreshold) {
        determinedScrollDirection = 'up';
        console.log('Peace Sign Scroll Direction: UP (based on upright gesture form and orientation)');
      } else {
        determinedScrollDirection = null; // Upright peace form, but not clearly pointing up
        console.log('Peace Sign Scroll Direction: NEUTRAL/UNCLEAR (upright form, but not pointing up enough)');
      }
    } else { // Attempting an INVERTED peace sign (handInverted is true)
      if (indexTipLandmark.y > wrist.y + currentPeaceSettings.scrollDirectionThreshold) {
        determinedScrollDirection = 'down';
        console.log('Peace Sign Scroll Direction: DOWN (based on inverted gesture form and orientation)');
      } else {
        determinedScrollDirection = null; // Inverted peace form, but not clearly pointing down
        console.log('Peace Sign Scroll Direction: NEUTRAL/UNCLEAR (inverted form, but not pointing down enough)');
      }
    }
  } else {
    // Log includes scoring orientation (which might be inaccurate if not a peace sign, but indicates what was attempted)
    console.log(`Peace Sign NOT detected (Attempted Form: ${handInverted ? 'Inverted' : 'Upright'}). Score: ${peaceScore.toFixed(3)} (Threshold: ${currentPeaceSettings.peaceConfidenceThreshold})`);
  }
  
  return {
    detected: isPeaceSignClear,
    direction: determinedScrollDirection,
    confidence: peaceScore
  };
}

/**
 * Process peace gesture detection with confidence tracking
 * @param {Array} landmarks - Hand landmarks from MediaPipe
 * @returns {Object} - Object with detection status and scroll direction
 */
function processPeaceDetection(landmarks) {
  const peaceResult = detectPeaceGesture(landmarks); // peaceResult.detected is if sign is clear, peaceResult.direction can be null

  if (peaceResult.detected && peaceResult.direction) { // Only process if sign is clear AND direction is determined
    peaceConfidence = Math.min(1.0, peaceConfidence + 0.3); // Increase confidence for the peace sign
    consecutivePeaceFrames++;
    peaceScrollDirection = peaceResult.direction; // Set the current scroll direction
  } else {
    // If peace sign not clear, or direction is null, decrease confidence or reset frames
    peaceConfidence = Math.max(0.0, peaceConfidence - 0.1);
    consecutivePeaceFrames = Math.max(0, consecutivePeaceFrames - 1);
    if (consecutivePeaceFrames === 0) {
      peaceScrollDirection = null; // If gesture is lost or unstable, reset scroll direction
    }
    // If the sign was detected but direction was null, ensure peaceScrollDirection is also nullified for this processing cycle
    if (peaceResult.detected && !peaceResult.direction) {
        peaceScrollDirection = null;
    }
  }
  
  // Stable detection requires enough frames, high enough confidence, AND a clear scroll direction
  const stablePeaceDetectedAndDirectionClear = consecutivePeaceFrames >= currentPeaceSettings.requiredPeaceFrames &&
                                            peaceConfidence > 0.6 && // General confidence in the peace sign pattern
                                            peaceScrollDirection !== null; // A direction ('up' or 'down') must be set

  return {
    detected: stablePeaceDetectedAndDirectionClear, // This 'detected' means "ready to scroll"
    direction: peaceScrollDirection,                // The determined scroll direction
    confidence: peaceConfidence                     // The current confidence score for the peace sign pattern
  };
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
 * Handle peace gesture state changes for scrolling
 * @param {Object} gestureResult - Peace gesture detection result
 * @param {Function} onScrollCallback - Callback function for scroll events
 */
function handlePeaceGestureStateChange(gestureResult, onScrollCallback) {
  const { detected, direction } = gestureResult;

  if (detected && direction && currentPeaceSettings.peaceGestureEnabled) {
    // Gesture is active, has a direction, and peace gestures are enabled.
    if (!peaceCooldown) { // Not in "inter-scroll tick" cooldown.
      if (onScrollCallback) {
        onScrollCallback(direction); // Perform scroll.
      }
      
      // Set "inter-scroll tick" cooldown based on minScrollInterval.
      // This prevents scrolling faster than minScrollInterval.
      peaceCooldown = true; 
      if (peaceCooldownTimeout) clearTimeout(peaceCooldownTimeout);
      peaceCooldownTimeout = setTimeout(() => {
        peaceCooldown = false; // Allow next scroll tick.
      }, currentPeaceSettings.minScrollInterval);
    }
    // If lastPeaceState was false, it means the gesture sequence just started.
    // The longer "inter-gesture sequence" cooldown is handled when the gesture ends.
  } else {
    // Gesture not detected, or no direction, or peace gestures disabled.
    if (lastPeaceState && !detected) { 
      // Gesture sequence just ended.
      clearTimeout(peaceCooldownTimeout); // Clear any pending "inter-scroll tick" cooldown.
      peaceCooldown = true; // Start "inter-gesture sequence" cooldown.
      peaceCooldownTimeout = setTimeout(() => {
        peaceCooldown = false; // Allow a new gesture sequence to start.
      }, currentPeaceSettings.peaceCooldown); // Use the main peaceCooldownDuration from settings.
      console.log('Peace gesture sequence ended. Main cooldown initiated.');
    }
  }
  lastPeaceState = detected; // Update the state for the next frame.
}

/**
 * Reset gesture detection state
 */
function resetGestureState() {
  fistConfidence = 0;
  consecutiveFistFrames = 0;
  lastFistState = false;
  fistCooldown = false;
  
  // Reset peace gesture state
  peaceConfidence = 0;
  consecutivePeaceFrames = 0;
  lastPeaceState = false; // Ensure this is reset
  peaceCooldown = false;  // Ensure this is reset
  lastPeaceDirection = null;
  peaceScrollDirection = null;
  
  // Clear timeouts
  if (fistCooldownTimeout) {
    clearTimeout(fistCooldownTimeout);
    fistCooldownTimeout = null;
  }
  
  if (peaceCooldownTimeout) {
    clearTimeout(peaceCooldownTimeout);
    peaceCooldownTimeout = null;
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
function updateGestureSettings(newSettings) {
  // Update fist gesture settings
  if (newSettings.fistConfidenceThreshold !== undefined) {
    fistConfidenceThreshold = Math.max(0.3, Math.min(0.95, newSettings.fistConfidenceThreshold));
  }
  
  if (newSettings.requiredFistFrames !== undefined) {
    requiredFistFrames = Math.max(1, Math.min(10, newSettings.requiredFistFrames));
  }
  
  if (newSettings.fistCooldown !== undefined) {
    // Update the cooldown value, but don't interrupt current cooldown
    const newCooldown = Math.max(100, Math.min(2000, newSettings.fistCooldown));
    // Update for next cooldown cycle
    fistCooldownDuration = newCooldown;
  }
  if (newSettings.minimumLockDuration !== undefined) {
    minimumLockDuration = Math.max(50, Math.min(500, newSettings.minimumLockDuration));
  }

  // Update peace gesture settings
  currentPeaceSettings.peaceGestureEnabled = newSettings.peaceGestureEnabled ?? currentPeaceSettings.peaceGestureEnabled;
  currentPeaceSettings.peaceConfidenceThreshold = newSettings.peaceConfidenceThreshold ?? currentPeaceSettings.peaceConfidenceThreshold;
  currentPeaceSettings.requiredPeaceFrames = newSettings.peaceRequiredFrames ?? currentPeaceSettings.requiredPeaceFrames;
  currentPeaceSettings.peaceCooldown = newSettings.peaceCooldown ?? currentPeaceSettings.peaceCooldown;
  currentPeaceSettings.scrollSensitivity = newSettings.scrollSensitivity ?? currentPeaceSettings.scrollSensitivity;
  currentPeaceSettings.minScrollInterval = newSettings.minScrollInterval ?? currentPeaceSettings.minScrollInterval;
  currentPeaceSettings.scrollDirectionThreshold = newSettings.scrollDirectionThreshold ?? currentPeaceSettings.scrollDirectionThreshold; // Update new setting


  console.log('Gesture settings updated:', { 
    fistConfidenceThreshold, requiredFistFrames, fistCooldownDuration, minimumLockDuration,
    peaceGestureEnabled: currentPeaceSettings.peaceGestureEnabled,
    peaceConfidenceThreshold: currentPeaceSettings.peaceConfidenceThreshold, 
    peaceRequiredFrames: currentPeaceSettings.requiredPeaceFrames, 
    peaceCooldown: currentPeaceSettings.peaceCooldown, 
    minScrollInterval: currentPeaceSettings.minScrollInterval,
    scrollDirectionThreshold: currentPeaceSettings.scrollDirectionThreshold 
  });
}

/**
 * Get current gesture settings (e.g., for UI or other modules)
 * @returns {Object} - Current gesture settings
 */
function getGestureSettings() {
  return {
    fistConfidenceThreshold,
    requiredFistFrames,
    fistCooldown: fistCooldownDuration,
    minimumLockDuration,
    // Peace gesture settings from currentPeaceSettings
    peaceGestureEnabled: currentPeaceSettings.peaceGestureEnabled,
    peaceConfidenceThreshold: currentPeaceSettings.peaceConfidenceThreshold,
    peaceRequiredFrames: currentPeaceSettings.requiredPeaceFrames,
    peaceCooldown: currentPeaceSettings.peaceCooldown,
    scrollSensitivity: currentPeaceSettings.scrollSensitivity,
    minScrollInterval: currentPeaceSettings.minScrollInterval,
    scrollDirectionThreshold: currentPeaceSettings.scrollDirectionThreshold // Include new setting
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
  getGestureSettings,
  processPeaceDetection,
  handlePeaceGestureStateChange
};
