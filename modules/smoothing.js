// smoothing.js - Advanced smoothing system for cursor movement
// This module handles cursor position smoothing for better accessibility

// Smoothing configuration
let smoothingEnabled = true;
let smoothingFactor = 0.7; // Higher = more smoothing (0.1 = very responsive, 0.9 = very smooth)
let maxHistoryLength = 8; // Number of frames to average
let movementThreshold = 0.005; // Minimum movement to register (reduces micro-jitter)
let velocitySmoothing = 0.8; // Smooth velocity changes
let deadZoneRadius = 0.003; // Dead zone around current position to ignore tiny movements

// Smoothing state variables
let positionHistory = []; // Store recent positions for advanced smoothing
let lastVelocity = { x: 0, y: 0 };
let stabilizationFrames = 0; // Count frames when hand is stable
let stabilizationThreshold = 3; // Frames needed before considering hand "stable"

/**
 * Add position to history for smoothing calculations
 * @param {Object} position - Position object with x, y coordinates
 */
function addToPositionHistory(position) {
  positionHistory.push({
    x: position.x,
    y: position.y,
    timestamp: Date.now()
  });
  
  // Keep only recent positions
  if (positionHistory.length > maxHistoryLength) {
    positionHistory.shift();
  }
}

/**
 * Calculate smoothed position using weighted average
 * @param {Object} currentPosition - Current raw position
 * @returns {Object} - Smoothed position
 */
function calculateSmoothedPosition(currentPosition) {
  if (!smoothingEnabled || positionHistory.length === 0) {
    return currentPosition;
  }
  
  // Add current position to history
  addToPositionHistory(currentPosition);
  
  // Calculate weighted average with more weight on recent positions
  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;
  
  positionHistory.forEach((pos, index) => {
    // More recent positions get higher weight
    const weight = Math.pow(smoothingFactor, positionHistory.length - index - 1);
    weightedX += pos.x * weight;
    weightedY += pos.y * weight;
    totalWeight += weight;
  });
  
  return {
    x: weightedX / totalWeight,
    y: weightedY / totalWeight
  };
}

/**
 * Apply movement smoothing to reduce jitter
 * @param {Object} currentPosition - Current hand position
 * @param {Object} lastPosition - Previous hand position
 * @returns {Object} - Smoothed hand position
 */
function applySmoothingToMovement(currentPosition, lastPosition) {
  if (!lastPosition) {
    return currentPosition;
  }
  
  // Calculate movement distance
  const deltaX = currentPosition.x - lastPosition.x;
  const deltaY = currentPosition.y - lastPosition.y;
  const movementDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Apply dead zone - ignore very small movements
  if (movementDistance < deadZoneRadius) {
    stabilizationFrames++;
    if (stabilizationFrames >= stabilizationThreshold) {
      // Hand is stable, return last position to reduce jitter
      return lastPosition;
    }
  } else {
    stabilizationFrames = 0; // Reset stabilization counter
  }
  
  // Check movement threshold
  if (movementDistance < movementThreshold) {
    return lastPosition; // Ignore micro-movements
  }
  
  // Apply velocity smoothing
  const currentVelocity = { x: deltaX, y: deltaY };
  const smoothedVelocity = {
    x: lastVelocity.x * velocitySmoothing + currentVelocity.x * (1 - velocitySmoothing),
    y: lastVelocity.y * velocitySmoothing + currentVelocity.y * (1 - velocitySmoothing)
  };
  
  lastVelocity = smoothedVelocity;
  
  // Apply smoothed velocity to get new position
  return {
    x: lastPosition.x + smoothedVelocity.x,
    y: lastPosition.y + smoothedVelocity.y
  };
}

/**
 * Apply temporal smoothing to cursor position
 * @param {Object} newPosition - New cursor position
 * @param {Object} currentPosition - Current cursor position
 * @returns {Object} - Smoothed cursor position
 */
function applyTemporalSmoothing(newPosition, currentPosition) {
  if (!currentPosition) {
    return newPosition;
  }
  
  // Apply exponential smoothing
  return {
    x: currentPosition.x * smoothingFactor + newPosition.x * (1 - smoothingFactor),
    y: currentPosition.y * smoothingFactor + newPosition.y * (1 - smoothingFactor)
  };
}

/**
 * Reset smoothing state
 */
function resetSmoothingState() {
  positionHistory = [];
  lastVelocity = { x: 0, y: 0 };
  stabilizationFrames = 0;
}

/**
 * Update smoothing settings
 * @param {Object} settings - Smoothing configuration object
 */
function updateSmoothingSettings(settings) {
  if (settings.smoothingFactor !== undefined) {
    smoothingFactor = Math.max(0.1, Math.min(0.9, settings.smoothingFactor));
  }
  if (settings.movementThreshold !== undefined) {
    movementThreshold = Math.max(0.001, Math.min(0.02, settings.movementThreshold));
  }
  if (settings.deadZoneRadius !== undefined) {
    deadZoneRadius = Math.max(0.001, Math.min(0.01, settings.deadZoneRadius));
  }
  if (settings.enabled !== undefined) {
    smoothingEnabled = settings.enabled;
  }
}

/**
 * Get current smoothing settings
 * @returns {Object} - Current smoothing configuration
 */
function getSmoothingSettings() {
  return {
    smoothingFactor,
    movementThreshold,
    deadZoneRadius,
    enabled: smoothingEnabled,
    maxHistoryLength,
    velocitySmoothing
  };
}

// Export functions for use in other modules
window.Smoothing = {
  calculateSmoothedPosition,
  applySmoothingToMovement,
  applyTemporalSmoothing,
  resetSmoothingState,
  updateSmoothingSettings,
  getSmoothingSettings
};
